import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  gridSize: number = 3; 
  symbols: string[] = ["X", "O"];
  currentPlayer: number = 0;
  grid: string[][] = [];
  svgContent: SafeHtml = '';
  turn: number = 0;

  @ViewChild('gridSvg') gridSvg: ElementRef | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  
  generateGrid(gridSizeInput: HTMLInputElement) {
    const size = parseInt(gridSizeInput.value);
    console.log('Taille de la grille :', size);
    if (size >= 3) {
      this.gridSize = size;
      this.grid = new Array(this.gridSize).fill(null).map(() => new Array(this.gridSize).fill(null));
      this.currentPlayer = 0;
  
      const cellWidth = (100 / this.gridSize) - 5; // Ajuster pour l'épaisseur des lignes
      const cellHeight = (100 / this.gridSize) - 5;
      let svgString = '';
  
      // Generate rectangles for the grid
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          const x = j * cellWidth;
          const y = i * cellHeight;
          svgString += `<rect x="${x}%" y="${y}%" width="${cellWidth}%" height="${cellHeight}%" fill="green"></rect>`;
        }
      }
  
      const svgContent = `<svg id="grid" class="grid-svg" width="50%" height="50%" viewBox="0 0 100 100">${svgString}</svg>`;
      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgContent);
         
      // Sélectionner les rectangles après avoir créé la grille SVG
      setTimeout(() => {
        if (this.gridSvg) {
          const svgElement = this.gridSvg.nativeElement;
          const rects = svgElement.querySelectorAll('rect');
          console.log('Rectangles sélectionnés:', rects);
  
          rects.forEach((rect: any, index: number) => {
            console.log('Ajout de l\'événement de clic à un rectangle');
            rect.addEventListener('click', () => {
              const row = Math.floor(index / this.gridSize);
              const col = index % this.gridSize;
              this.handleCellClick(row, col);
            });
          });
        }
      }, 0);
    } else {
      alert("La taille de la grille doit être au moins 3.");
    }
  }

  

 


  ngAfterViewInit() {
    setTimeout(() => {
      console.log('Rectangles:');
      if (this.gridSvg) {
        const svgElement = this.gridSvg.nativeElement;
        const rects = svgElement.querySelectorAll('rect');
        console.log('Rectangles sélectionnés:', rects);
  
        rects.forEach((rect: any, index: number) => {
          console.log('Ajout de l\'événement de clic à un rectangle');
          rect.addEventListener('click', () => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            this.handleCellClick(row, col);
          });
        });
      }
    }, 0);
  }
  



  
  handleCellClick(row: number, col: number) {
    console.log('Cellule cliquée : ', row, col);
    if (this.grid[row][col] === null) {
      this.grid[row][col] = this.symbols[this.currentPlayer]; // Assigner le symbole en fonction du joueur actuel
      this.currentPlayer = 1 - this.currentPlayer; // Alterner entre les joueurs (0 devient 1, 1 devient 0)
  
      // Mettre à jour le SVG
      this.updateSVG(() => {});
  
      // Vérifier s'il y a un gagnant ou un match nul
      const winner = this.checkWinner();
      if (winner) {
        // Remise de la fonction après l'affichage du résultat
        setTimeout(() => {
          // Vérifier si les trois symboles successifs sont alignés avant d'afficher l'alerte
          if (this.grid.flat().filter(symbol => symbol === winner).length >= 3) {
            // Afficher le message approprié en fonction du gagnant
            if (winner === "X") {
              alert(`Le joueur X a gagné !`);
            } else {
              alert(`Le joueur O a gagné !`);
            }
            // Réinitialiser le jeu après l'affichage de l'alerte
            this.resetGame();
          }
        }, 0);
      } else if (this.isDraw()) {
        // Si le jeu est un match nul, afficher l'alerte, puis réinitialiser le jeu
        alert("Match nul !");
        // Réinitialiser le jeu après l'affichage de l'alerte
        this.resetGame();
      }
    }
  }
  
  
  
  
  
  
  
  
  
  









  updateSVG(callback: () => void) {
    let svgString = '';
  
    // Draw X or O based on the grid values
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const cellWidth = 100 / this.gridSize;
        const cellHeight = 100 / this.gridSize;
        const xOffset = j * cellWidth + cellWidth / 2;
        const yOffset = i * cellHeight + cellHeight / 2;
        const symbol = this.grid[i][j];
  
        // Dessiner le symbole dans la case s'il existe
        if (symbol) {
          svgString += `<text x="${xOffset}%" y="${yOffset}%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="black">${symbol}</text>`;
        }
      }
    }
  
    // Générer le contenu SVG avec le texte ajouté
    const svgContent = `<svg id="grid" width="100%" height="100%" viewBox="0 0 100 100">${svgString}</svg>`;
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgContent);
  
    callback(); // Appel de la fonction de rappel
  }
  
  
  
  
  
  
  
  
  





  checkWinner(): string | null {
    // Check rows and columns for winning combinations
    for (let i = 0; i < this.gridSize; i++) {
      // Check rows
      if (
        this.grid[i][0] === this.grid[i][1] &&
        this.grid[i][1] === this.grid[i][2] &&
        this.grid[i][0] !== null
      ) {
        return this.grid[i][0];
      }
      // Check columns
      if (
        this.grid[0][i] === this.grid[1][i] &&
        this.grid[1][i] === this.grid[2][i] &&
        this.grid[0][i] !== null
      ) {
        return this.grid[0][i];
      }
    }
  
    // Check diagonals
    const diagonal1 = this.grid[0][0];
    const diagonal2 = this.grid[0][2];
    if (
      (diagonal1 !== null &&
        this.grid[1][1] === diagonal1 &&
        this.grid[2][2] === diagonal1) ||
      (diagonal2 !== null &&
        this.grid[1][1] === diagonal2 &&
        this.grid[2][0] === diagonal2)
    ) {
      return this.grid[1][1];
    }
  
    // No winner found
    return null;
  }
  
  
  
  

  isDraw(): boolean {
    // Check if all cells are filled
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === null) {
          return false;
        }
      }
    }

    return true;
  }


  resetGame() {
    this.grid = new Array(this.gridSize).fill(null).map(() => new Array(this.gridSize).fill(null));
    this.currentPlayer = 0;
    this.turn = 0;
    this.updateSVG(() => {}); // Mettre à jour le SVG après la réinitialisation
  }


  
}
