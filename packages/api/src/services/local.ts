

export const localAPI = {
    getData: async (name: string) => {
        let myStorage;
        let data = null

        try {

            myStorage = window.localStorage;
            data = myStorage.getItem(name); // Попробуйте записать что-то в localStorage

            return data

        } catch (e) {

            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь к Админимстратору.");
            return data
        }

    },
    getParsedData: async (name: string) => {
        let myStorage;
        let data = null

        try {

            myStorage = window.localStorage;
            data = myStorage.getItem(name); // Попробуйте записать что-то в localStorage
            if (!data) {
                return null
            }
            const parsedData = JSON.parse(data as string)
            return parsedData

        } catch (e) {

            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь к Админимстратору.");
            return data
        }

    },

    setData: async (data: any, name: string) => {
        try {
            let myStorage;
            let jsnData = JSON.stringify({ ...data })
            myStorage = window.localStorage;
            myStorage.setItem(name, jsnData);
            let jsnupdtdData = myStorage.getItem(name);
            if (!jsnupdtdData) {
                return null
            }
            let updtdData = JSON.parse(jsnupdtdData as string)

            return updtdData

        } catch (e) {
            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь пожалуйста к разработчику");
            return null
        }

    },

    setReportData: async (data: any, name: string) => {
        try {
            let myStorage;
            let jsnData = JSON.stringify(data)
            myStorage = window.localStorage;
            myStorage.setItem(name, jsnData);
            let jsnupdtdData = myStorage.getItem(name);
            if (!jsnupdtdData) {
                return null
            }
            let updtdData = JSON.parse(jsnupdtdData as string)

            return updtdData

        } catch (e) {
            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь пожалуйста к разработчику");
            return null
        }
    }

}