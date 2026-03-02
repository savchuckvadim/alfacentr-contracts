import { PresetCode } from '@/apps/rq/enums/preset-code.enum';
import { PresetConfig, DEFAULT_PRESET_IDS } from '../consts/preset.consts';

/**
 * Утилиты для работы с пресетами
 */

/**
 * Получает конфигурацию пресетов из PortalModel
 */
export const getPresetConfig = (PortalModel: any): PresetConfig => {
    const presetOrg = PortalModel.getPresetForName(PresetCode.ORG);
    const presetIp = PortalModel.getPresetForName(PresetCode.IP);
    const presetFiz = PortalModel.getPresetForName(PresetCode.FIZ);

    return {
        org: presetOrg?.bitrix_id || DEFAULT_PRESET_IDS.org,
        ip: presetIp?.bitrix_id || DEFAULT_PRESET_IDS.ip,
        fiz: presetFiz?.bitrix_id || DEFAULT_PRESET_IDS.fiz,
    };
};
