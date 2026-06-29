import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const regex = /^(?:\+221|00221)?(7[05678]\d{7})$/;
    const valid = regex.test(control.value.replace(/\s+/g, ''));
    return valid ? null : { invalidPhone: true };
  };
}

export function differentPhoneValidator(senderPhone: string | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!senderPhone) {
      return null;
    }
    const destination = control.get('destination')?.value;
    if (!destination) {
      return null;
    }
    
    const cleanSender = senderPhone.replace(/\s+/g, '').replace(/^(?:00221)/, '+221');
    const cleanDest = destination.replace(/\s+/g, '').replace(/^(?:00221)/, '+221');
    const senderSuffix = cleanSender.length > 9 ? cleanSender.substring(cleanSender.length - 9) : cleanSender;
    const destSuffix = cleanDest.length > 9 ? cleanDest.substring(cleanDest.length - 9) : cleanDest;
    
    if (senderSuffix === destSuffix) {
      return { samePhone: true };
    }
    return null;
  };
}
