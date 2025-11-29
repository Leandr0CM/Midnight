import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';

@Component({
  selector: 'app-embers',
  standalone: true,
  imports: [],
  templateUrl: './embers.html',
  styleUrl: './embers.css'
})
export class EmbersComponent implements AfterViewInit, OnDestroy {
  @ViewChild('embersBackground') embersBackground!: ElementRef<HTMLElement>;

  private intervalId?: number | NodeJS.Timeout;

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && this.embersBackground) {
        this.startEmbersAnimation();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId as any);
    }
  }

  startEmbersAnimation(): void {
    const container = this.embersBackground.nativeElement;

    this.ngZone.runOutsideAngular(() => {
        this.intervalId = setInterval(() => {
            const ember = document.createElement('div');
            ember.classList.add('ember');

            // --- AJUSTES NA GERAÇÃO DA BRASA ---
            const size = Math.random() * 10 + 5; // Tamanho menor: entre 5px e 15px
            const duration = Math.random() * 4 + 3; // Duração mais curta: entre 3s e 7s
            const position = Math.random() * 100;
            
            // Cores mais vibrantes e variadas, com um toque de amarelho/laranja
            const colors = ['#ff4500', '#ffa500', '#ff6347', '#ff8c00', '#ffd700', '#ffcc00'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            ember.style.width = `${size}px`;
            ember.style.height = `${size}px`;
            ember.style.left = `${position}%`;
            ember.style.backgroundColor = color;
            
            container.appendChild(ember);

            const animation = ember.animate([
                { bottom: '-20px', opacity: 0.8 },
                { bottom: '100%', opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'ease-out'
            });
            
            animation.finished.then(() => ember.remove());

        }, 100); // Gerar brasas mais frequentemente: a cada 100ms
    });
  }
}