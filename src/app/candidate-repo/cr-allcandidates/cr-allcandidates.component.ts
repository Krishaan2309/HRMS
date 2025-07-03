import { Component } from '@angular/core';


interface Candidate {
  name: string;
  email: string;
  mobile: string;
  status: string;
  lastUpdated: string;
  positionApplied: string;
  touched?: boolean;
  statusType?: 'interested' | 'cnr' | 'not-interested' | '';
}


@Component({
  selector: 'app-cr-allcandidates',
  templateUrl: './cr-allcandidates.component.html',
  styleUrls: ['./cr-allcandidates.component.css']
})
export class CrAllcandidatesComponent {


  activeTab: 'all' | 'manually-added' | 'imported' | 'from-consultancy' = 'all';

  candidates: Candidate[]

  setActiveTab(tab: 'all' | 'manually-added' | 'imported' | 'from-consultancy') {
    this.activeTab = tab;
  }
}
