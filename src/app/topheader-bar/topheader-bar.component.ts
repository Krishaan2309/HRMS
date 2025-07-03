import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { TopheaderService } from '../topheader.service';
@Component({
  selector: 'app-topheader-bar',
  templateUrl: './topheader-bar.component.html',
  styleUrls: ['./topheader-bar.component.css']
})
export class TopheaderBarComponent {


  constructor(private router: Router,
    private topHeaderService: TopheaderService){
  }

  breadcrumb: string = '';


  ngOnInit(){
    console.log("Top header ngonit")


    this.breadcrumb = this.topHeaderService.getBreadcrumb()
    console.log(this.breadcrumb)


    setInterval(() => {
      this.breadcrumb = this.topHeaderService.getBreadcrumb();
    }, 100);
  
    
  }
}
