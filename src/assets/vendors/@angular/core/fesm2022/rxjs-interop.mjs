/**
 * @license Angular v17.0.7
 * (c) 2010-2022 Google LLC. https://angular.io/
 * License: MIT
 */

import { assertInInjectionContext, inject, DestroyRef, Injector, effect, untracked, assertNotInReactiveContext, signal, ɵRuntimeError, computed } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Operator which completes the Observable when the calling context (component, directive, service,
 * etc) is destroyed.
 *
 * @param destroyRef optionally, the `DestroyRef` representing the current context. This can be
 *     passed explicitly to use `takeUntilDestroyed` outside of an [injection
 * context](guide/dependency-injection-context). Otherwise, the current `DestroyRef` is injected.
 *
 * @developerPreview
 */
function takeUntilDestroyed(destroyRef) {
    if (!destroyRef) {
        assertInInjectionContext(takeUntilDestroyed);
        destroyRef = inject(DestroyRef);
    }
    const destroyed$ = new Observable(observer => {
        const unregisterFn = destroyRef.onDestroy(observer.next.bind(observer));
        return unregisterFn;
    });
    return (source) => {
        return source.pipe(takeUntil(destroyed$));
    };
}

/**
 * Exposes the value of an Angular `Signal` as an RxJS `Observable`.
 *
 * The signal's value will be propagated into the `Observable`'s subscribers using an `effect`.
 *
 * `toObservable` must be called in an injection context unless an injector is provided via options.
 *
 * @developerPreview
 */
function toObservable(source, options) {
    !options?.injector && assertInInjectionContext(toObservable);
    const injector = options?.injector ?? inject(Injector);
    const subject = new ReplaySubject(1);
    const watcher = effect(() => {
        let value;
        try {
            value = source();
        }
        catch (err) {
            untracked(() => subject.error(err));
            return;
        }
        untracked(() => subject.next(value));
    }, { injector, manualCleanup: true });
    injector.get(DestroyRef).onDestroy(() => {
        watcher.destroy();
        subject.complete();
    });
    return subject.asObservable();
}

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * With `requireSync` set to `true`, `toSignal` will assert that the `Observable` produces a value
 * immediately upon subscription. No `initialValue` is needed in this case, and the returned signal
 * does not include an `undefined` type.
 *
 * By default, the subscription will be automatically cleaned up when the current [injection
 * context](/guide/dependency-injection-context) is destroyed. For example, when `toObservable` is
 * called during the construction of a component, the subscription will be cleaned up when the
 * component is destroyed. If an injection context is not available, an explicit `Injector` can be
 * passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 *
 * @developerPreview
 */
function toSignal(source, options) {
    ngDevMode &&
        assertNotInReactiveContext(toSignal, 'Invoking `toSignal` causes new subscriptions every time. ' +
            'Consider moving `toSignal` outside of the reactive context and read the signal value where needed.');
    const requiresCleanup = !options?.manualCleanup;
    requiresCleanup && !options?.injector && assertInInjectionContext(toSignal);
    const cleanupRef = requiresCleanup ? options?.injector?.get(DestroyRef) ?? inject(DestroyRef) : null;
    // Note: T is the Observable value type, and U is the initial value type. They don't have to be
    // the same - the returned signal gives values of type `T`.
    let state;
    if (options?.requireSync) {
        // Initially the signal is in a `NoValue` state.
        state = signal({ kind: 0 /* StateKind.NoValue */ });
    }
    else {
        // If an initial value was passed, use it. Otherwise, use `undefined` as the initial value.
        state = signal({ kind: 1 /* StateKind.Value */, value: options?.initialValue });
    }
    // Note: This code cannot run inside a reactive context (see assertion above). If we'd support
    // this, we would subscribe to the observable outside of the current reactive context, avoiding
    // that side-effect signal reads/writes are attribute to the current consumer. The current
    // consumer only needs to be notified when the `state` signal changes through the observable
    // subscription. Additional context (related to async pipe):
    // https://github.com/angular/angular/pull/50522.
    const sub = source.subscribe({
        next: value => state.set({ kind: 1 /* StateKind.Value */, value }),
        error: error => {
            if (options?.rejectErrors) {
                // Kick the error back to RxJS. It will be caught and rethrown in a macrotask, which causes
                // the error to end up as an uncaught exception.
                throw error;
            }
            state.set({ kind: 2 /* StateKind.Error */, error });
        },
        // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
        // "complete".
    });
    if (ngDevMode && options?.requireSync && state().kind === 0 /* StateKind.NoValue */) {
        throw new ɵRuntimeError(601 /* ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT */, '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.');
    }
    // Unsubscribe when the current context is destroyed, if requested.
    cleanupRef?.onDestroy(sub.unsubscribe.bind(sub));
    // The actual returned signal is a `computed` of the `State` signal, which maps the various states
    // to either values or errors.
    return computed(() => {
        const current = state();
        switch (current.kind) {
            case 1 /* StateKind.Value */:
                return current.value;
            case 2 /* StateKind.Error */:
                throw current.error;
            case 0 /* StateKind.NoValue */:
                // This shouldn't really happen because the error is thrown on creation.
                // TODO(alxhub): use a RuntimeError when we finalize the error semantics
                throw new ɵRuntimeError(601 /* ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT */, '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.');
        }
    });
}

/**
 * Generated bundle index. Do not edit.
 */

export { takeUntilDestroyed, toObservable, toSignal };
//# sourceMappingURL=rxjs-interop.mjs.map