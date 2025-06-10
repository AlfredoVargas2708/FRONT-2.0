import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { options } from '../../fields/options';
import { AppService } from '../../services/app.service';
import { tableHeaders } from '../../fields/tableHeaders';
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
  addFormFields = addFormFields;
  showResults: boolean = false;
  selectedSearchBy: string = '';
  selectedOption: string = '';

  addForm: FormGroup;

  @ViewChild('searchByInput') searchByInput!: ElementRef;

  constructor(private fb: FormBuilder, private appService: AppService) {
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
    this.searchByInput.nativeElement.value = '';
    if (searchBy) {
      this.loadResults(this.optionsResults.find(option => option.label === searchBy).name);
    }
  }

  loadResults(searchBy: any): void {
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
    this.selectedOption = event.target.value;
    this.searchResults = this.originalSearchResults.filter(result => result.toLowerCase().includes(event.target.value.toLowerCase()));
    this.showResults = this.searchResults.length > 0;
  }

  onSelectOption(option: any): void {
    this.selectedSearchBy = option;
    this.showResults = false;
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
}