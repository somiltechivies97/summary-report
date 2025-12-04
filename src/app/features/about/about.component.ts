import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="about-container">
      <h1>About This App</h1>
      <div class="content">
        <p>
          This is a sample Angular application demonstrating a proper folder structure
          and best practices for organizing your Angular projects.
        </p>
        <p>
          The application uses Angular's standalone components and follows modern
          Angular development patterns.
        </p>
        
        <h2>Technologies Used</h2>
        <ul>
          <li>Angular {{ angularVersion }}</li>
          <li>TypeScript</li>
          <li>RxJS</li>
          <li>Angular Router</li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  angularVersion = '20';
}