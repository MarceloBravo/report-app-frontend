import {
  mdiAccountCircleOutline,
  mdiAt,
  mdiArrowRight,
  mdiBadgeAccountOutline,
  mdiCheckCircle,
  mdiChevronRight,
  mdiConsole,
  mdiDatabaseOutline,
  mdiDomain,
  mdiEmailOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiFolderOutline,
  mdiKeyVariant,
  mdiLightningBolt,
  mdiLoading,
  mdiLockOutline,
  mdiPound,
  mdiServer,
  mdiShieldCheckOutline,
  mdiShieldLockOutline,
  mdiShieldOutline,
  mdiSitemap,
} from '@mdi/js';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ICONS = {
  'account-circle': mdiAccountCircleOutline,
  at: mdiAt,
  'arrow-right': mdiArrowRight,
  badge: mdiBadgeAccountOutline,
  'check-circle': mdiCheckCircle,
  'chevron-right': mdiChevronRight,
  console: mdiConsole,
  database: mdiDatabaseOutline,
  domain: mdiDomain,
  email: mdiEmailOutline,
  'eye-off': mdiEyeOffOutline,
  eye: mdiEyeOutline,
  'folder-data': mdiFolderOutline,
  hash: mdiPound,
  key: mdiKeyVariant,
  loading: mdiLoading,
  lock: mdiLockOutline,
  bolt: mdiLightningBolt,
  schema: mdiSitemap,
  server: mdiServer,
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
