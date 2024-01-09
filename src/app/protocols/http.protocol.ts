import { HttpHeaders } from "@angular/common/http";

export interface IHttpService {
    getHeaders(): Promise<HttpHeaders>
}