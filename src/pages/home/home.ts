import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PainDiaryPage } from '../pain-diary/pain-diary';
import { GenerateReportPage } from '../generate-report/generate-report';
import { LoginPage } from '../login/login';
import { Observable } from 'rxjs/Observable';
import { Chart } from 'chart.js';
import { Http, Response, URLSearchParams, Headers } from '@angular/http';
import { AuthService } from "../../security/auth.service";
import { API_URL } from "../../environments/environment";
/*
  Generated class for the Home page.
  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  flag;
  laboratoryDate;
  rheumatologistDate;
  graph;
  graphList;

  // lineChar for Pain diary graph -  need setup data for the graphs to work
  public lineChartData1: Array<any> =
  [{ data: [0], label: 'pain' },
  { data: [0], label: 'disease activity' },
  { data: [0], label: 'fatigue' }];
  public lineChartLabels1: Array<any> = [];

  // lineChart for eHAQ graph
  public lineChartData2: Array<any> = [{ data: [0], label: 'eHAQ' }];
  public lineChartLabels2: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private _http: Http, private _authService: AuthService) {
    this.flag = "../../assets/img/flag-green.png";
    this.laboratoryDate = "22.04.2017 (Suggestion)";
    this.rheumatologistDate = "20.05.2017";
    this.graph = "1"; // shows segment 1 (graph 1)
    this.getGraphInfo();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  // buttons for side navigation
  painDiary() {
    this.navCtrl.setRoot(PainDiaryPage);
  }
  generateReport() {
    this.navCtrl.setRoot(GenerateReportPage);
  }

  setGraphInfo(list: Array<string>) {
    var ehaq: Array<number> = [];
    var pain: Array<number> = [];
    var fatigue: Array<number> = [];
    var disease: Array<number> = [];

    // iterating through all dates and adding them to the right graph, O(5n) notation
    for (var i = 1; i < list.length - 1; i++) {
      var element = list[i].split(',', 5); // seperating elements 

      // adding all eHAQ elements  
      if (((element[4] && element[0]) != null) && ((element[4].localeCompare('') != 0))) { 
        this.lineChartLabels2.push(element[0]);
        ehaq.push(parseFloat(element[4]));
      }

      // adding all pain diary elements if the list is not empty or do not contain pain diary data
      if (element[0] != null && (element[1] || element[2] || element[3] != null) && (element[1] || element[2] || element[3]).localeCompare('') != 0) {
        this.lineChartLabels1.push(element[0]); // adding date
        if (element[1].localeCompare('') == 0) // adding pain
          pain.push(null);
        else
          pain.push(parseFloat(element[1]));
        if (element[2].localeCompare('') == 0) // adding disease 
          disease.push(null);
        else
          disease.push(parseFloat(element[2]));

        if (element[3].localeCompare('') == 0) // adding fatigue
          fatigue.push(null);
        else
          fatigue.push(parseFloat(element[3]));
      }
    } 
    this.lineChartData1 = [{ data: pain, label: 'pain' },
    { data: disease, label: 'disease activity' },
    { data: fatigue, label: 'fatigue' }];
    this.lineChartData2 = [{ date: ehaq, label: 'eHAQ' }];
    console.log("Graph data loading succeeded")
  }

  // Graph info from database
  public getGraphInfo() {
    var object = this.getChart();
    object.forEach(value => {
      this.setGraphInfo(value.split('\n'));   

    });
  }

  // get charts from database
  public getChart(): Observable<string> {
    const headers: Headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this._authService.loggedInUser().authToken);

    var params = new URLSearchParams();
    var object =
      this._http.get(API_URL + '/chart/csv', {
        headers,
        search: params,
      })
        .map(res => res.text())
        .catch(this.handleError);
    return object;
  }

  private handleError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    if (error.status === 404) return Observable.throw('Eintrag nicht gefunden.');
    if (error.status === 403)
      return Observable.throw('Sie sind derzeit nicht angemeldet oder Sie haben keine Berechtigung, diese Seite aufzurufen.');
    if (error.status === 401) return Observable.throw('Permission denied.');
    console.error(error);
    let errorMessage: string = null;
    if (error.json) {
      try {
        errorMessage = error.json().error;
      } catch (e) {
        errorMessage = 'Server error: ' + (error.statusText ? error.statusText : error);
      }
    }
    return Observable.throw(errorMessage);
  }

  // --------- lineChart settings for all graphs  ---------
  public lineChartOptions: any = {
    pointDot: false,
    responsive: true,
    innerHeight: 100,
    pointDotRadius: 3
  };
  public maxTextLines: number = 3;
  public lineChartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }
  public chartHovered(e: any): void {
    console.log(e);
  }
}
