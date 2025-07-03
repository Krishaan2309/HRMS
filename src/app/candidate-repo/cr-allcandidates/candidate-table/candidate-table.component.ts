import { Component, ViewChild, ViewEncapsulation, Input, OnChanges, AfterViewChecked } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { CandidateRepoService } from 'src/app/candidate-repo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-table',
  templateUrl: './candidate-table.component.html',
  styleUrls:['./candidate-table.component.css']
})
export class CandidateTableComponent {

  @Input()
  activeTab: any;
  selectedReviewStatus: string;
  candidates: any[] = [];
  selectedRows = 10;
  totalRecords = 0;
  loading = false;
  globalFilterValue = '';
  rowsPerPageOptions = [10, 25, 50];

  

  globalFilterFields = [
    'CandidateName',
    'EmailId',
    'Mobile',
    'status',
    'lastupdatedDate',
    'notes',
    'position',
  ];
  shouldResetTable = false;
    // Date filter properties
  lastUpdatedDateFilter: Date | null = null;
  profileReceivedDateFilter: Date | null = null;
  profileAddedDateFilter: Date | null = null;
  todayDate: Date | null = null; // Keep this for backward compatibility
  allCandidatesTouchCount: number = 0; 
  manuallyAddedTouchCount: number = 0;
  importedCandidatesTouchCount: number = 0;
  @ViewChild('table') table!: Table;

  constructor(private http: HttpClient,
    private candidateRepoService: CandidateRepoService,
    private router: Router
  ) {
  }

  ngOnChanges(){
    if(this.table){
      this.table.reset()
      this.clearDateFilters()
    }
  }

   // Method to handle date filtering
  onDateFilter(event: any, field: string, filterCallback: Function) {
    if (event) {
      // Format the date to match your backend expected format
      const formattedDate = this.formatDateForFilter(event);
      filterCallback(formattedDate);
    } else {
      // Clear the filter
      filterCallback(null);
    }
  }


  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.globalFilterValue = input.value;
    this.table.reset();
  }
  reviewStatusFilter(reviewStatus:string){
    this.selectedReviewStatus = reviewStatus;

    if(this.table){
      this.table.reset()
      this.clearDateFilters()
    }
  }



loadCandidates(event: TableLazyLoadEvent) {
  const sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField ?? '';
  const sortOrder = typeof event.sortOrder === 'number' ? event.sortOrder : 1;

  let filterQueryParts: string[] = [];
  let filteredColumns: string[] = [];

  // 🌟 Step 1: Process table filters (including date filters)
  if (event.filters) {
    for (const key in event.filters) {
      const filterGroup = event.filters[key];
      const filtersArray = Array.isArray(filterGroup) ? filterGroup : [filterGroup];

      for (const filter of filtersArray) {
        if (filter?.value !== undefined && filter?.value !== null) {
          let matchMode = filter.matchMode?.toLowerCase();
          let operator = '';
          let filterValue = filter.value;

          // 🎯 Special handling for date fields
          const dateFields = ['lastUpdatedDateTime', 'profileReceivedDate', 'profileAddedDateTime'];
          
          if (dateFields.includes(key)) {
            // Handle date filtering
            if (filterValue instanceof Date) {
              // Format date to ISO string or your preferred format
              filterValue = this.formatDateForFilter(filterValue);
              operator = '='; // Use equals for date matching
            } else if (typeof filterValue === 'string' && filterValue) {
              operator = '=';
            } else {
              continue; // Skip invalid date values
            }
          } else {
            // Handle non-date fields with existing logic
            if (matchMode === 'equals') {
              operator = '=';
            } else if (matchMode === 'notequals') {
              operator = '!=';
            } else if (matchMode === 'dateis') {
              // Handle dateIs match mode for date fields
              operator = '=';
              if (filterValue instanceof Date) {
                filterValue = this.formatDateForFilter(filterValue);
              }
            } else {
              operator = `~${matchMode}`;
            }
          }

          filterQueryParts.push(`${key}${operator}${filterValue}`);
          filteredColumns.push(key);
        }
      }
    }
  }

  // 🌟 Step 2: Add importId filter based on activeTab
  if (this.activeTab === 'manually-added') {
    filterQueryParts.push('importId=0');
    filteredColumns.push('importId');
    if(this.manuallyAddedTouchCount===0){
      this.selectedReviewStatus=''
      this.manuallyAddedTouchCount++
      this.importedCandidatesTouchCount = 0
      this.allCandidatesTouchCount = 0
    }
  } else if (this.activeTab === 'imported') {
    filterQueryParts.push('importId!=0');
    filteredColumns.push('importId');
    if(this.importedCandidatesTouchCount===0){
      this.selectedReviewStatus=''
      this.importedCandidatesTouchCount++
      this.manuallyAddedTouchCount = 0
      this.allCandidatesTouchCount = 0
    }
  } else if (this.activeTab === 'all') {
    
    if(this.allCandidatesTouchCount===0){
      this.selectedReviewStatus=''
      this.allCandidatesTouchCount++
      this.manuallyAddedTouchCount = 0
    this.importedCandidatesTouchCount = 0
    }
    

  }

  // 🌟 Step 3: Add review status filter
  if (this.selectedReviewStatus === 'true') {
    filterQueryParts.push('isReviewed=true');
    filteredColumns.push('isReviewed');
  } else if (this.selectedReviewStatus === 'false') {
    filterQueryParts.push('isReviewed=false');
    filteredColumns.push('isReviewed');
  }

  // 🌟 Step 4: Prepare request params
  let params = new HttpParams()
    .set('skip', (event.first ?? 0).toString())
    .set('take', (event.rows ?? 10).toString())
    .set('sortField', sortField)
    .set('sortOrder', sortOrder.toString())
    .set('globalFilter', this.globalFilterValue)
    .set('globalSearchFields', "candidateName,candidateEmail,candidateMobile");

  if (filterQueryParts.length) {
    params = params.set('filters', filterQueryParts.join(','));
    params = params.set('filteredColumns', [...new Set(filteredColumns)].join(','));
  }

  console.log('Filter params:', params);
  console.log('Date filters applied:', filterQueryParts.filter(f => 
    f.includes('lastUpdatedDateTime') || 
    f.includes('profileReceivedDate') || 
    f.includes('profileAddedDateTime')
  ));

  // 🌟 Step 5: Make API call
  this.candidateRepoService.getAllCandidates(params).subscribe({
    next: (res) => {
      this.candidates = res.data.data;
      console.log('Loaded candidates:', this.candidates);
      this.totalRecords = res.data.totalCount;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading candidates:', err);
      this.loading = false;
    }
  });
}

// 🔧 Helper method to format date for API filtering
private formatDateForFilter(date: Date): string {
  if (!date) return '';
  
  // Format as YYYY-MM-DD (adjust based on your API requirements)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
  
  // Alternative formats if your API expects different format:
  // return date.toISOString().split('T')[0]; // YYYY-MM-DD
  // return date.toISOString(); // Full ISO string with time
  // return date.getTime().toString(); // Unix timestamp
}

// 🔧 Method to handle date filter changes (call this from template)
onDateFilterChange(event: any, field: string, filterCallback: Function) {
  console.log(`Date filter changed for ${field}:`, event);
  
  if (event && event instanceof Date) {
    const formattedDate = this.formatDateForFilter(event);
    console.log(`Formatted date for ${field}:`, formattedDate);
    filterCallback(event); // Pass the Date object to PrimeNG
  } else {
    console.log(`Clearing date filter for ${field}`);
    filterCallback(null);
  }
}

// 🔧 Method to clear all date filters
clearDateFilters() {
  this.lastUpdatedDateFilter = null;
  this.profileReceivedDateFilter = null;
  this.profileAddedDateFilter = null;
  this.todayDate = null;
  
  // Clear table filters and reload
  if (this.table) {
    this.table.clear();
  }
}

// 🔧 Additional helper method to check if a field is a date field
private isDateField(fieldName: string): boolean {
  const dateFields = [
    'lastUpdatedDateTime',
    'profileReceivedDate', 
    'profileAddedDate',
    'createdDateTime',
    'profileAddedDateTime'
  ];
  return dateFields.includes(fieldName);
}

  getStatusClass(status: string): string {
    switch (status) {
      case 'Interested':
        return 'bg-green-100 text-green-700';
      case 'CNR':
        return 'bg-orange-100 text-orange-700';
      case 'Not Interested':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  }

  getMenuItems(candidate: any): MenuItem[] {
    return [
      { label: 'View Profile', icon: 'pi pi-user', command: () => this.viewProfile(candidate) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.editCandidate(candidate) },
    ];
  }


  viewProfile(candidate: any) {
  console.log('View Profile:', candidate);
  this.candidateRepoService.selectedCandidate = candidate;
  this.candidateRepoService.tableView = 'View';
  this.router.navigate(['candidate-repo/profile'])
  const currentUrl = this.router.url;
  this.candidateRepoService.lastUrl = currentUrl;
}

editCandidate(candidate: any) {
  console.log('Edit Candidate:', candidate);
  this.candidateRepoService.selectedCandidate = candidate;
  this.candidateRepoService.tableEdit = 'Edit';
  this.router.navigate(['candidate-repo/add-candidate'])
}

getRowClass(candidate: any): string {
  switch (candidate.status) {
    case 'Touched':
      return 'row-touched';
    case 'Untouched':
      return 'row-untouched';
    default:
      return '';
  }
}
  
}
