import { Pipe, PipeTransform } from '@angular/core';
import { BANNER_STATUS_LABELS } from '../../core/constants/banner.constants';
import { BannerStatus } from '../../core/models/banner.model';

@Pipe({
  name: 'statusLabel',
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: BannerStatus): string {
    return BANNER_STATUS_LABELS[status] ?? status;
  }
}
