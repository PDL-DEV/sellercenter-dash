import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AccessLogin } from '../entities/access-login';
import { HttpUtils } from '../../../utils/http.utils';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../entities/user';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { AccountCookiesKeys } from '../enums/account-cookies-keys.enum';
import { StringUtils } from '../../../utils/string.utils';
import { DateUtils } from '../../../utils/date.utils';
import { isPlatformBrowser } from '@angular/common';
import { IHttpService } from '../../../protocols/http.protocol';

@Injectable()
export class AccountService implements IHttpService {

  private apiV1 = environment.apiV1;

  private user!: BehaviorSubject<User | null>;
  private accessLogin!: BehaviorSubject<AccessLogin | null>;

  constructor(
    private readonly http: HttpClient,
    private readonly cookie: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.user = new BehaviorSubject<User | null>(this.getUserLogged());
    this.accessLogin = new BehaviorSubject<AccessLogin | null>(this.getAccessLogin());
  }

  /** @internal */
  async getHeaders(): Promise<HttpHeaders> {
    const headers = await HttpUtils.getHeadersDefault();

    const accessToken = await this.getAccessLogin();
    if (accessToken) {
      headers.Authorization = await `Bearer ${accessToken.access_token}`;
    }

    return new HttpHeaders(headers);
  }

  async login(body: { email: string, password: string }): Promise<AccessLogin | null> {
    const headers = await this.getHeaders();

    return new Promise((resolve, reject) => {
      this.http.post<AccessLogin>(`${this.apiV1}/login`, body, { headers: headers }).subscribe(response => {
        resolve(response);
      }, e => {
        resolve(null);
      });
    });
  }

  async getUser(): Promise<User | null> {
    const headers = await this.getHeaders();

    return new Promise((resolve, reject) => {
      this.http.get<User>(`${this.apiV1}/manager/user`, { headers: headers }).subscribe(response => {
        resolve(response);
      }, e => {
        resolve(null);
      });
    });
  }

  async setUserLogged(user: User): Promise<void> {
    const encryp = await CryptoJS.AES.encrypt(JSON.stringify(JSON.stringify(user)), AccountCookiesKeys.USER_LOGGED_KEY).toString();
    const hostname = await HttpUtils.getHostnameWithoutWWW();
    const date = await DateUtils.getDateInFuture(60);

    await this.cookie.set(AccountCookiesKeys.USER_LOGGED_KEY, encryp, date, '/', hostname, HttpUtils.isSecureProtocol(), 'Lax');
    await this.user.next(user);
  }

  async setAccessLogin(accessLogin: AccessLogin): Promise<void> {
    const encryp = await CryptoJS.AES.encrypt(JSON.stringify(JSON.stringify(accessLogin)), AccountCookiesKeys.ACCESS_TOKEN_KEY).toString();
    const hostname = await HttpUtils.getHostnameWithoutWWW();
    const date = await DateUtils.getDateInFuture(60);

    await this.cookie.set(AccountCookiesKeys.ACCESS_TOKEN_KEY, encryp, date, '/', hostname, HttpUtils.isSecureProtocol(), 'Lax');
    await this.accessLogin.next(accessLogin);
  }

  getAccessLogin(): AccessLogin | null {
    if (this.cookie.get(AccountCookiesKeys.ACCESS_TOKEN_KEY)) {
      try {
        let cus = this.cookie.get(AccountCookiesKeys.ACCESS_TOKEN_KEY);
        let decryp, decryp2: AccessLogin;
        decryp = CryptoJS.AES.decrypt(cus, AccountCookiesKeys.ACCESS_TOKEN_KEY)
        decryp2 = JSON.parse(decryp.toString(CryptoJS.enc.Utf8));// DECRYP 2

        if (typeof decryp2 == "string") {
          decryp2 = JSON.parse(decryp2);
        }

        return decryp2;
      } catch (error) {
        this.logout();
      }
    }

    return null;
  }

  getUserLogged(): User | null {
    if (this.cookie.get(AccountCookiesKeys.USER_LOGGED_KEY)) {
      try {
        let cus = this.cookie.get(AccountCookiesKeys.USER_LOGGED_KEY);
        let decryp, decryp2: User;
        decryp = CryptoJS.AES.decrypt(cus, AccountCookiesKeys.USER_LOGGED_KEY)
        decryp2 = JSON.parse(decryp.toString(CryptoJS.enc.Utf8));// DECRYP 2

        if (typeof decryp2 == "string") {
          decryp2 = JSON.parse(decryp2);
        }

        return decryp2;
      } catch (error) {
        this.logout();
      }
    }

    return null;
  }

  async logout() {
    if (isPlatformBrowser(this.platformId)) {
      const hostname = HttpUtils.getHostnameWithoutWWW();

      if (this.user) {
        this.user.next(null);
        this.accessLogin.next(null);
        this.cookie.delete(AccountCookiesKeys.USER_LOGGED_KEY, '/', hostname, HttpUtils.isSecureProtocol(), 'Lax');
        this.cookie.delete(AccountCookiesKeys.ACCESS_TOKEN_KEY, '/', hostname, HttpUtils.isSecureProtocol(), 'Lax');
      }
    }

  }
}
