import { Component } from '@angular/core';
import { CandidateRepoService } from '../candidate-repo.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-candidate-repo',
  templateUrl: './candidate-repo.component.html',
  styleUrls: ['./candidate-repo.component.css']
})
export class CandidateRepoComponent {

  constructor(private candidateRepoService:CandidateRepoService){}

  ngOnInit() {
  this.candidateRepoService.userInfo$.pipe(
    filter(user => user !== null),
    take(1)
  ).subscribe(() => {
    // now safe to render child components or trigger data loads
  });
}

  
}
