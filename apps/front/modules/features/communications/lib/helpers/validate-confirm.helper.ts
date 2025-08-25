import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';

export const getValidateEmail = async (email: string) => {
    try {
        const validate = await backAPI.service<{ errors?: string[] }>(
            EBACK_ENDPOINT.VALIDATE_CHECK_EMAIL,
            API_METHOD.POST,
            {
                email,
            },
        );

        return validate.errors?.[0] || '';
    } catch (error) {

        return '';
    }
};

export const getValidatePhone = async (phone: string) => {
    try {
        const validate = await backAPI.service<{ errors?: string[] }>(
            EBACK_ENDPOINT.VALIDATE_CHECK_PHONE,
            API_METHOD.POST,
            {
                phone,
            },
        );

        return validate.errors?.[0] || '';
    } catch (error) {

        return '';
    }
};
