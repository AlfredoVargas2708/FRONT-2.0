import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { options } from '../../fields/options';
import { AppService } from '../../services/app.service';
import { tableHeaders } from '../../fields/tableHeaders';
import { tableBody } from '../../fields/tableBody';
import { formField } from '../../fields/addForm';
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
  formFields = formField;
  tableHeaders = tableHeaders;
  tableBody = tableBody;
  showResults: boolean = false;
  showTable: boolean = false;
  isLoading: boolean = false;
  selectedSearchBy: string = '';
  selectedOption: string = '';
  legoId: number = 0;
  isEditSet: boolean = false;

  addForm: FormGroup;
  initialEditForm: any = {};
  editForm: FormGroup;

  @ViewChild('searchByInput') searchByInput!: ElementRef;

  constructor(private fb: FormBuilder, private appService: AppService, private cdr: ChangeDetectorRef) {
    this.addForm = this.fb.group({});
    this.editForm = this.fb.group({});
    [this.addForm, this.editForm].forEach(form => {
      this.loadForm(form);
    })
    this.loadOptions();
  }

  loadForm(form: FormGroup): void {
    this.formFields.forEach(field => {
      form.addControl(field.name, this.fb.control(''));
    });
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

  showSuccessToast(message: string): void {
    Swal.fire({
      title: 'Éxito',
      text: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  OnSubmitLego(): void {
    if (this.addForm.valid) {
      this.appService.addLego(this.addForm.value).subscribe({
        next: () => {
          this.showSuccessToast('Lego agregado correctamente');
          this.addForm.reset();
        },
        error: () => {
          this.showErrorToast('No se pudo agregar la pieza de Lego');
        }
      });
    }
  }

  showErrorToast(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  loadLegoResults(): void {
    this.startRefresh();
    this.appService.getLegoResults(this.selectedSearchBy, this.selectedOption).subscribe({
      next: (results) => {
        this.legoResults = results;
        this.originalLegoResults = [...this.legoResults];
        this.endRefresh();
      },
      error: (error) => {
        console.error('Error fetching Lego results:', error);
        this.showErrorToast('No se pudieron cargar los resultados de Lego');
        this.endRefresh();
        this.legoResults = [];
        this.originalLegoResults = [];
      }
    })
  }

  onEditLego(lego: any): void {
    this.legoId = lego.id;
    this.initialEditForm = { ...lego };
    this.editForm.patchValue(lego);
  }

  startRefresh() {
    this.isLoading = true;
    this.showTable = false;
    this.cdr.markForCheck();
  }

  endRefresh() {
    this.isLoading = false;
    this.showTable = true;
    this.cdr.markForCheck();
  }

  onClearSearch(): void {
    this.searchByInput.nativeElement.value = '';
    this.showResults = false;
    this.showTable = false;
    this.searchResults = [];
    this.originalSearchResults = [];
    this.selectedOption = '';
    this.selectedSearchBy = '';
    this.legoResults = [];
    this.originalLegoResults = [];
    this.isEditSet = false;
    this.addForm.reset();
    this.editForm.reset();
  }

  onAddLego(): void {
    if (this.editForm.valid) {
      this.startRefresh();
      this.isEditSet = this.editForm.value.lego !== this.initialEditForm.lego;
      this.initialEditForm = { ...this.editForm.value };
      this.initialEditForm = { ...this.initialEditForm, isEditSet: this.isEditSet };
      this.appService.editLego(this.initialEditForm, this.legoId).subscribe({
        next: (response) => {
          this.showSuccessToast('Lego editado correctamente');
          this.legoResults = this.legoResults.map(lego => {
            if (lego.id === this.legoId) {
              lego = { ...lego, ...response.data }
            }
            return lego;
          });
          this.originalLegoResults = [...this.legoResults];
          this.editForm.reset();
          this.isEditSet = false;
          this.endRefresh();
        },
        error: (error) => {
          this.showErrorToast('No se pudo editar la pieza de Lego');
          console.error('Error editing Lego:', error);
          this.editForm.reset();
          this.isEditSet = false;
          this.endRefresh();
        }
      })
    }
  }
}