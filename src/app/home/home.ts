import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { tableHeaders } from '../../fields/tableHeaders';
import { editFormFields } from '../../fields/editForm';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  legoPieces: any[] = [];
  originalLegoPieces: any[] = [];
  searchOptions: any[] = [];
  originalOptions: any[] = [];
  tableHeaders = tableHeaders;
  editFormFields = editFormFields;
  selectedSearchBy: string = '';
  selectedOption: string = '';
  showSearchOptions: boolean = false;

  editForm: FormGroup;

  @ViewChild('searchByInput') searchInput!: ElementRef;

  constructor(private appService: AppService, private fb: FormBuilder) {
    this.editForm = this.fb.group({});
    this.editFormFields.forEach(field => {
      this.editForm.addControl(field.name, this.fb.control(''));
    });
  }

  ngOnInit(): void {
    this.loadPieces();
  }

  loadPieces(): void {
    this.appService.getLegoPieces().subscribe({
      next: (data) => {
        this.legoPieces = data;
        this.loadSetImages();
        this.loadPieceImage();
        this.originalLegoPieces = [...this.legoPieces];
      },
      error: (error) => {
        console.error('Error fetching lego pieces:', error);
      }
    })
  }

  loadSetImages(): void {
    this.appService.getSetImages().subscribe({
      next: (images) => {
        this.legoPieces.forEach(piece => {
          const image = images.find((img: any) => img.code_sets === piece.lego);
          if (image) {
            piece.image_set = image.image_set;
          } else {
            piece.image_set = 'https://assets.lego.com/logos/v4.5.0/brand-lego.svg';
          }
        });
      },
      error: (error) => {
        console.error('Error fetching set images:', error);
      }
    });
  }

  loadPieceImage(): void {
    this.legoPieces = this.legoPieces.map(piece => {
      return {
        ...piece,
        image: `https://www.lego.com/cdn/product-assets/element.img.photoreal.192x192/${piece.code}.jpg`
      }
    });
  }

  onSearchByChange(event: any): void {
    const searchBy = event.target.value;
    switch (searchBy) {
      case 'codigo-set':
        this.getOptions('lego');
        break;
      case 'lego-set':
        this.getOptions('set');
        break;
      case 'task':
        this.getOptions('task');
        break;
      case 'pedido':
        this.getOptions('pedido');
        break;
      case 'completo':
        this.getOptions('completo');
        break;
      case 'reemplazado':
        this.getOptions('reemplazado');
        break;
    }
  }

  getOptions(category: string): void {
    this.selectedSearchBy = category;
    this.searchInput.nativeElement.value = '';
    this.showSearchOptions = false;
    this.appService.getOptions(category).subscribe({
      next: (options) => {
        this.searchOptions = options;
        this.originalOptions = [...options];
      },
      error: (error) => {
        console.error('Error fetching options:', error);
      }
    })
  }

  onSearchInput(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm !== '') {
      this.legoPieces = this.originalLegoPieces.filter(piece =>
        piece.code.toLowerCase().includes(searchTerm)
      );
      if (this.legoPieces.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No se encontraron resultados',
          text: 'Por favor, intenta con un término de búsqueda diferente.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }
    } else {
      this.legoPieces = [...this.originalLegoPieces];
    }
  }

  onSearchOptionInput(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.searchOptions = this.originalOptions.filter(option => option[this.selectedSearchBy].toLowerCase().includes(searchTerm))
    this.showSearchOptions = true;
  }

  onOptionSelected(option: any): void {
    this.selectedOption = option[this.selectedSearchBy];
    this.showSearchOptions = false;
    this.legoPieces = this.originalLegoPieces.filter(piece => piece[this.selectedSearchBy] === this.selectedOption);
  }

  openEditModal(piece: any): void {
    console.log('Open edit modal for piece:', piece);
    this.editForm.patchValue(piece);
  }
}
