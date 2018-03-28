import {Component, OnInit} from '@angular/core';
import {DatePipe} from "@angular/common";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  bgImage: String;

  constructor() {
    this.bgImage = this.getRandomImage();
    console.log('[home] bgimage=', this.bgImage);
  };

  ngOnInit() {
    console.debug('[home] init page');
  }

  getRandomImage() {
    const datePipe = new DatePipe('en-US');
    const now = Date.now();

    var imageCountByKind = {
      'ray': 7,
      'spring': 0,
      'summer': 0,
      'autumn': 0,
      'winter': 0
    };

    var kind;
    // Or landscape

    if (Math.random() < 0.5) {
      kind = 'ray';
    }
    else {
      const day = datePipe.transform(now, 'D');
      const month = datePipe.transform(now, 'M');
      if ((month < 3) || (month == 3 && day < 21) || (month == 12 && day >= 21)) {
        kind = 'winter';
      }
      else if ((month == 3 && day >= 21) || (month < 6) || (month == 6 && day < 21)) {
        kind = 'spring';
      }
      else if ((month == 6 && day >= 21) || (month < 9) || (month == 9 && day < 21)) {
        kind = 'summer';
      }
      else {
        kind = 'autumn';
      }
    }
    var imageCount = imageCountByKind[kind];
    if (imageCount == 0) return this.getRandomImage();
    var imageIndex = Math.floor(Math.random()*imageCount)+1;
    return './assets/img/bg/'+kind+'-' + imageIndex +'.jpg';
  }

}
