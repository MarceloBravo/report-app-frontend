import {
  mdiArrowRight,
  mdiCheckCircle,
  mdiChevronRight,
  mdiConsole,
  mdiDatabaseOutline,
  mdiEmailOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiKeyVariant,
  mdiLoading,
  mdiLockOutline,
  mdiShieldCheckOutline,
  mdiShieldLockOutline,
  mdiShieldOutline,
} from '@mdi/js';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ICONS = {
  'arrow-right': mdiArrowRight,
  'check-circle': mdiCheckCircle,
  'chevron-right': mdiChevronRight,
  console: mdiConsole,
  database: mdiDatabaseOutline,
  email: mdiEmailOutline,
  eye: mdiEyeOutline,
  'eye-off': mdiEyeOffOutline,
  key: mdiKeyVariant,
  loading: mdiLoading,
  lock: mdiLockOutline,
  shield: mdiShieldOutline,
  'shield-check': mdiShieldCheckOutline,
  'shield-lock': mdiShieldLockOutline,
} as const;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);

  protected readonly path = computed(() => ICONS[this.name()]);
}
