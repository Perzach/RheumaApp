import { Component, ViewChild } from '@angular/core';
import { Nav, Platform} from 'ionic-angular';

import { HomePage } from '../pages/home/home';
import { BloodTestPage } from '../pages/blood-test/blood-test';
import { EDASPage } from '../pages/e-das/e-das';
import { EHAQPage } from '../pages/e-haq/e-haq';
import { GenerateReportPage } from '../pages/generate-report/generate-report';
import { LoginPage } from '../pages/login/login';
import { LogoutPage } from '../pages/logout/logout';
import { PainDiaryPage } from '../pages/pain-diary/pain-diary';
import { SettingsPage } from '../pages/settings/settings';
import { UserGuidePage } from '../pages/user-guide/user-guide';
import { AuthService } from '../security/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { NetworkService } from '../services/network.service'
import { Storage } from '@ionic/storage';
import {API_URL} from '../environments/environment';
import {Http, Response, Headers} from "@angular/http";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  private home;
  private report;
  private pain;
  private haq;
  private das;
  private blood;
  private guide;
  private settings;
  private logOut;

  pages: Array<{ icon: string, title: string, component: any }>;

  constructor(public platform: Platform,
    private _statusBar: StatusBar,
    private _splashScreen: SplashScreen,
    private _authService: AuthService,
    private translate: TranslateService,
    private storage: Storage,
    private _network: NetworkService,
    private _http: Http) {

    this.initializeApp();

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // This is the language the app will use
    translate.use('en');

    this.setTitles().subscribe(
      value => {
        this.pages = [
          { icon: "home", title: this.home, component: HomePage },
          // { icon: "print", title: this.report, component: GenerateReportPage },
          { icon: "pulse", title: this.pain, component: PainDiaryPage },
          { icon: "man", title: this.haq, component: EHAQPage },
          //{ icon: "body",title: this.das, component: EDASPage },
          // { icon: "medkit",title: this.blood, component: BloodTestPage },
          //{ icon: "help-circle",title: this.guide, component: UserGuidePage },
          { icon: "settings", title: this.settings, component: SettingsPage },
          { icon: "exit", title: this.logOut, component: LogoutPage }

        ];
      }
    );
    this.storage.ready().then(() => {
      this.storage.get("graphMonths").then((val) => {
        if (val == null || val == undefined) {
          this.storage.set("graphMonths", 3)
        }
      }
      )
    })

    // Set connection status
    console.log("Checking network...")
    this.testConnection()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this._statusBar.styleDefault();
      this._splashScreen.hide();
    });
  }


  setTitles(): Observable<string | Object> {
    this.translate.get('menu.home').subscribe(
      value => this.home = value
    );

    this.translate.get('menu.report').subscribe(
      value => this.report = value
    );

    this.translate.get('menu.pain').subscribe(
      value => this.pain = value
    );

    this.translate.get('menu.haq').subscribe(
      value => this.haq = value
    );

    this.translate.get('menu.das').subscribe(
      value => this.das = value
    );

    this.translate.get('menu.blood').subscribe(
      value => this.blood = value
    );

    this.translate.get('menu.guide').subscribe(
      value => this.guide = value
    );

    this.translate.get('menu.settings').subscribe(
      value => this.settings = value
    );

    this.translate.get('menu.logOut').subscribe(
      value => {
        this.logOut = value
      }
    );

    return this.translate.get('menu.logOut');
  }

  // Perhaps it would be better to implement a /heartbeat accesspoint to
  // the backend that always returns 200 OK, and use this instead of empty login
  // to test internet connection.
  testConnection(): void{
    let password = "" // Empty password for testing connection
    let username = "" // Empty username for testing connection

    const LOGIN_API_URL = API_URL + '/auth/login';

    const headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const credentials: string = JSON.stringify({
        username,
        password,
    });

    this._http.post(LOGIN_API_URL, credentials, {headers,})
        .subscribe(() =>{
          // Received status 200 OK
          this._network.setConnected(true)

        }, (err) => {
          // Received some error
          this._network.setConnected(false)
        });

  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component)
      .catch(() => this.nav.setRoot(LogoutPage))
  }
}
