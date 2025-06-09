import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  legoPieces: any[] = [];

  constructor(private appService: AppService) { }

  ngOnInit(): void {
    this.loadPieces();
  }

  loadPieces(): void {
    this.appService.getLegoPieces().subscribe({
      next: (data) => {
        this.legoPieces = data;
        this.loadImages();
      },
      error: (error) => {
        console.error('Error fetching lego pieces:', error);
      }
    })
  }

  loadImages(): void {
    this.appService.getSetImages().subscribe({
      next: (images) => {
        this.legoPieces.forEach(piece => {
          const image = images.find((img: any) => img.code_sets === piece.lego);
          if (image) {
            piece.image = image.image_set;
          } else {
            piece.image = 'https://assets.lego.com/logos/v4.5.0/brand-lego.svg';
          }
        });
      },
      error: (error) => {
        console.error('Error fetching set images:', error);
      }
    });
  }
}
