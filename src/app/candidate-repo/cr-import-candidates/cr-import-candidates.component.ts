import { Component , ViewChild ,ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CandidateRepoService } from 'src/app/candidate-repo.service';
import { CandidateImportRequestModel } from 'src/modals/candidate-import-modal';
import { ToastService } from 'src/app/toast.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cr-import-candidates',
  templateUrl: './cr-import-candidates.component.html',
  styleUrls: ['./cr-import-candidates.component.css']
})
export class CrImportCandidatesComponent {

  constructor(
    private candidateRepoService: CandidateRepoService,
    private router: Router,
    private toastService: ToastService
  ){}

  downloadExcelTemplate() {
    // Define your headers
    const headers = [
      'Job Title', 'Date of application', 'Name', 'Email ID', 'Phone Number',
      'Current Location', 'Preferred Locations', 'Total Experience',
      'Curr. Company name', 'Curr. Company Designation', 'Department', 'Role',
      'Industry', 'Key Skills', 'Annual Salary', 'Notice period/ Availability to join',
      'Resume Headline', 'Summary', 'Under Graduation degree', 'UG Specialization',
      'UG University/institute Name', 'UG Graduation year', 'Post graduation degree',
      'PG specialization', 'PG university/institute name', 'PG graduation year',
      'Doctorate degree', 'Doctorate specialization', 'Doctorate university/institute name',
      'Doctorate graduation year', 'Gender', 'Marital Status', 'Home Town/City',
      'Pin Code', 'Work permit for USA', 'Date of Birth', 'Permanent Address',
      'Last Workflow activity', 'Last Workflow activity by', 'Time of Last Workflow activity Update',
      'Latest Pipeline Stage', 'Pipeline Status Updated By', 'Time when Stage updated',
      'Download', 'Downloaded By', 'Time Of Download', 'Viewed', 'Viewed By',
      'Time Of View', 'Emailed', 'Emailed By', 'Time Of Email', 'Calling Status',
      'Calling Status updated by', 'Time of Calling activity update', 'Comment 1',
      'Comment 1 BY', 'Time Comment 1 posted', 'Comment 2', 'Comment 2 BY',
      'Time Comment 2 posted', 'Comment 3', 'Comment 3 BY', 'Time Comment 3 posted',
      'Comment 4', 'Comment 4 BY', 'Time Comment 4 posted', 'Comment 5',
      'Comment 5 BY', 'Time Comment 5 posted', 'Candidate profile'
    ];
    
    // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);

  // Set column widths and attempt bold styling
  worksheet['!cols'] = headers.map(() => ({ width: 20 }));
  
  // Apply bold styling to header cells
  headers.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    
    // Initialize cell if it doesn't exist
    if (!worksheet[cellAddress]) {
      worksheet[cellAddress] = { t: 's', v: headers[colIndex] };
    }
    
    // Apply style - note this only works in some Excel viewers
    worksheet[cellAddress].s = { 
      font: { bold: true },
      alignment: { horizontal: 'center' }
    };
  });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidate Template');

  // Generate Excel file
  XLSX.writeFile(workbook, 'Candidate_Template.xlsx');
  }
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isChecked: boolean = false;
  isVisible = false;
  isDragging = false;
  selectedFile: File | null;
  filename = '';
  buttonText = 'Next';
  totalrows = 0;
  totalRecords:number
  duplicatesFound:number
  insertedRecords:number
  successImportDialog:boolean = false

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  triggerFileInput(): void {
    console.log("clicked")
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  closeFile(){
    this.isVisible = false;
    this.selectedFile = null;
    this.totalrows = 0;
    console.log(this.selectedFile)
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];


    console.log(file)
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  validateAndSetFile(file: File): void {
    
    const allowedTypes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv' // .csv
    ];
  
    if (allowedTypes.includes(file.type)) {
      this.filename = file.name;
      this.selectedFile = file;
      this.isVisible = true;
  
      const reader = new FileReader();
  
      reader.onload = (event: any) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
  
        const sheetName = workbook.SheetNames[0]; // First sheet
        const worksheet = workbook.Sheets[sheetName];
  
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const dataRows = rows.slice(1); // remove header row
        this.totalrows = dataRows.length;
        console.log('Number of data rows:', dataRows.length);
        console.log('Data:', dataRows);

      };
  
      reader.readAsArrayBuffer(file);
    } else {
      // alert('Please upload a valid Excel (.xls/.xlsx) or CSV file.');
      this.toastService.show('Please upload a valid Excel (.xls/.xlsx) or CSV file','info','Action Required')
      this.fileInput.nativeElement.value = '';
    }
  }
  
  async importCandidates(){
    if(this.selectedFile){
      const requestPayload: CandidateImportRequestModel = {
      templateName: 'Naukri',
      file: this.selectedFile,
      importedBy: this.candidateRepoService.getUserInfo().userId,
      importedSource: 'test'
    };
      this.candidateRepoService.importExcelFile(requestPayload)
      .subscribe({
        next: (res) => {
          console.log(res)
          this.totalRecords = res.data?.totalRecords;
          this.duplicatesFound = res.data?.duplicatesFound;
          this.insertedRecords = res.data?.insertedRecords;
          this.successImportDialog = true;
        },
        error: err => this.toastService.show('There is an Error Occured ${err}','error','Upload failed')
      });
      
    }
    else{
      // alert('Please select a valid file')
      this.toastService.show('Please select a valid file','info','Action Required')
    }
  }
  
  async closeDialog(){
    this.successImportDialog = !this.successImportDialog
  }
  async viewAllCandidates(){
    this.router.navigateByUrl('/candidate-repo/candidates')    
  }
  


}
