import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { tableHeaders } from '../../fields/tableHeaders';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  legoPieces: any[] = [];
  originalLegoPieces: any[] = [];
  posibleOptions: any[] = [];
  tableHeaders = tableHeaders;

  constructor(private appService: AppService) { }

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
    this.appService.getOptions(category).subscribe({
      next: (options) => {
        this.posibleOptions = options;
        console.log('Fetched options:', options);
      },
      error: (error) => {
        console.error('Error fetching options:', error);
      }
    })
  }
}
