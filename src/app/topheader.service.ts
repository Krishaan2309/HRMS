import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TopheaderService {
  public currentBreadcrumb: string = 'Candidate Repository > Dashboard';

  private routeMap: { [key: string]: string } = {
    '/candidate-repo/dashboard': 'Dashboard',
    '/candidate-repo/add-candidate': 'Add Candidate',
    '/candidate-repo/import-candidates': 'Import Candidate',
    '/candidate-repo/candidates': 'All Candidate',
    '/candidate-repo/profile': 'Candidate Profile'
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateBreadcrumb(event.urlAfterRedirects);
      });
  }

  private updateBreadcrumb(url: string): void {
    const page = this.routeMap[url];
    this.currentBreadcrumb = page
      ? `Candidate Repository > ${page}`
      : 'Candidate Repository';
  }

  getBreadcrumb(): string {
    return this.currentBreadcrumb;
  }
}
