import { Component, OnInit } from '@angular/core';
import { CandidateRepoService } from '../candidate-repo.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})


export class UnauthorizedComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(){
    this.authService.unauth()
  }
  async goToLogin() {
    await this.router.navigate(['/login']);
  }

  async logout() {
    await this.authService.logout();
  }
}

