import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
   
    const clean = value.replace(/\s+/g, '');
        if (clean.startsWith('+221') && clean.length === 13) {
      const country = clean.substring(0, 4);      // +221
      const operator = clean.substring(4, 6);     // 77
      const part1 = clean.substring(6, 9);        // 000
      const part2 = clean.substring(9, 11);       // 00
      const part3 = clean.substring(11, 13);      // 00
      return `${country} ${operator} ${part1} ${part2} ${part3}`;
    }
    
    if (clean.length === 9) {
      const operator = clean.substring(0, 2);     // 77
      const part1 = clean.substring(2, 5);        // 000
      const part2 = clean.substring(5, 7);        // 00
      const part3 = clean.substring(7, 9);        // 00
      return `${operator} ${part1} ${part2} ${part3}`;
    }

    return value;
  }
}
