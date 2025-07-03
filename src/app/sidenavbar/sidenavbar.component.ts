import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AuthUser } from 'src/modals/authUser';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidenavbar',
  templateUrl: './sidenavbar.component.html',
  styleUrls: ['./sidenavbar.component.css']
})
export class SidenavbarComponent implements OnInit {

  submenuOpen = false;
  isLoggedIn = false;
  user: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.authService.isLoggedIn(),
      this.authService.getUser()
    ])
    .pipe(
      filter(([isLoggedIn, user]) => isLoggedIn && !!user) // wait until both are available
    )
    .subscribe(([isLoggedIn, user]) => {
      this.isLoggedIn = isLoggedIn;
      this.user = user;
    });
  }

  toggleSubmenu() {
    this.submenuOpen = !this.submenuOpen;
  }

  logout() {
    this.authService.logout();
  }
}
