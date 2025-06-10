import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { options } from '../../fields/options';
import { AppService } from '../../services/app.service';
import { tableHeaders } from '../../fields/tableHeaders';
import { tableBody } from '../../fields/tableBody';
import { editFormFields } from '../../fields/editForm';
import { addFormFields } from '../../fields/addForm';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  options = options;
  pedidoOptions: any[] = [];
  completoOptions: any[] = [];
  optionsResults: any[] = [
    {
      name: 'code',
      label: 'Código-Pieza'
    },
    {
      name: 'lego',
      label: 'Código-Set'
    },
    {
      name: 'set',
      label: 'Lego-Set'
    },
    {
      name: 'task',
      label: 'Bolsa'
    },
    {
      name: 'pedido',
      label: 'Pedido'
    },
    {
      name: 'completo',
      label: 'Completo'
    },
    {
      name: 'reemplazado',
      label: 'Reemplazado'
    }
  ];
  searchResults: any[] = [];
  originalSearchResults: any[] = [];
  legoResults: any[] = [];
  originalLegoResults: any[] = [];
  addFormFields = addFormFields;
  tableHeaders = tableHeaders;
  tableBody = tableBody;
  showResults: boolean = false;
  showTable: boolean = false;
  isLoading: boolean = false;
  selectedSearchBy: string = '';
  selectedOption: string = '';

  addForm: FormGroup;

  @ViewChild('searchByInput') searchByInput!: ElementRef;

  constructor(private fb: FormBuilder, private appService: AppService, private cdr: ChangeDetectorRef) {
    this.addForm = this.fb.group({});
    this.addFormFields.forEach(field => {
      this.addForm.addControl(field.name, this.fb.control(''));
    });
    this.loadOptions();
  }

  loadOptions(): void {
    ['pedido', 'completo'].forEach(option => {
      this.appService.getOptions(option).subscribe({
        next: (options) => {
          if (option === 'pedido') {
            this.pedidoOptions = options;
          } else if (option === 'completo') {
            this.completoOptions = options;
          }
        }
      })
    })
  }

  onSearchByChange(event: any): void {
    const searchBy = event.target.value;
    this.selectedSearchBy = searchBy;
    this.searchByInput.nativeElement.value = '';
    this.showTable = false;
    this.searchResults = [];
    this.originalSearchResults = [];
    this.selectedOption = '';
    if (searchBy) {
      this.loadResults(this.optionsResults.find(option => option.label === searchBy).name);
    }
  }

  loadResults(searchBy: any): void {
    this.selectedSearchBy = searchBy;
    this.appService.getOptions(searchBy).subscribe({
      next: (options) => {
        this.searchResults = options.map((option: any) => option[searchBy]);
        this.originalSearchResults = [...this.searchResults];
      },
      error: (error) => {
        console.error('Error fetching search options:', error);
      }
    })
  }

  onSearchResult(event: any): void {
    this.searchResults = this.originalSearchResults.filter(result => result.toLowerCase().includes(event.target.value.toLowerCase()));
    this.showResults = this.searchResults.length > 0;
  }

  onSelectOption(option: any): void {
    this.selectedOption = option;
    this.searchByInput.nativeElement.value = option;
    this.showResults = false;
    this.loadLegoResults();
  }

  OnSubmitLego(): void {
    if(this.addForm.valid) {
      this.appService.addLego(this.addForm.value).subscribe({
        next: () => {
          Swal.fire({
            title: 'Éxito',
            text: 'Lego agregado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.addForm.reset();
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo agregar la pieza de Lego',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  }

  loadLegoResults(): void {
    this.isLoading = true;
    this.appService.getLegoResults(this.selectedSearchBy, this.selectedOption).subscribe({
      next: (results) => {
        this.legoResults = results;
        this.originalLegoResults = [...this.legoResults];
        this.showTable = this.legoResults.length > 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching Lego results:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los resultados de Lego',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    })
  }
}