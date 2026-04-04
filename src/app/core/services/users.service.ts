import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
import {
  RegisterRequest,
  LoginRequest,
  AccessTokenResponse,
  RefreshRequest,
  ResendConfirmationEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TwoFactorRequest,
  TwoFactorResponse,
  InfoRequest,
  InfoResponse,
  UpdateProfileRequest,
  HttpValidationProblemDetails,
} from '../models/users.models';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly httpService = inject(HttpService);
  private readonly usersPath = environment.apiPaths.users;

  register(request: RegisterRequest): Observable<never> {
    return this.httpService.post<never>(
      `${this.usersPath}/register`,
      request,
    );
  }

  login(
    request: LoginRequest,
    useCookies: boolean = false,
    useSessionCookies: boolean = false,
  ): Observable<AccessTokenResponse> {
    return this.httpService.post<AccessTokenResponse>(
      `${this.usersPath}/login?useCookies=${useCookies}&useSessionCookies=${useSessionCookies}`,
      request,
    );
  }

  refresh(request: RefreshRequest): Observable<AccessTokenResponse> {
    return this.httpService.post<AccessTokenResponse>(
      `${this.usersPath}/refresh`,
      request,
    );
  }

  confirmEmail(
    userId: string,
    code: string,
    changedEmail?: string,
  ): Observable<never> {
    const params = new URLSearchParams({
      userId,
      code,
    });

    if (changedEmail) {
      params.append('changedEmail', changedEmail);
    }

    return this.httpService.get<never>(
      `${this.usersPath}/confirmEmail?${params.toString()}`,
    );
  }

  resendConfirmationEmail(
    request: ResendConfirmationEmailRequest,
  ): Observable<never> {
    return this.httpService.post<never>(
      `${this.usersPath}/resendConfirmationEmail`,
      request,
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<never> {
    return this.httpService.post<never>(
      `${this.usersPath}/forgotPassword`,
      request,
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<never> {
    return this.httpService.post<never>(
      `${this.usersPath}/resetPassword`,
      request,
    );
  }

  manageTwoFactor(request: TwoFactorRequest): Observable<TwoFactorResponse> {
    return this.httpService.post<TwoFactorResponse>(
      `${this.usersPath}/manage/2fa`,
      request,
    );
  }

  getAccountInfo(): Observable<InfoResponse> {
    return this.httpService.get<InfoResponse>(`${this.usersPath}/manage/info`);
  }

  updateAccountInfo(request: InfoRequest): Observable<InfoResponse> {
    return this.httpService.post<InfoResponse>(
      `${this.usersPath}/manage/info`,
      request,
    );
  }

  logout(): Observable<never> {
    return this.httpService.post<never>(`${this.usersPath}/logout`, {});
  }

  updateProfile(request: UpdateProfileRequest): Observable<never> {
    return this.httpService.put<never>(`${this.usersPath}/profile`, request);
  }
}