import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger";


export const getSwaggerConfig = (app: INestApplication) => {
    const appName = process.env.APP_NAME || 'alfacentr';
    const config = new DocumentBuilder()
        .setTitle(`${appName} backend`)
        .setDescription(`API for ${appName} hooks and  frontends`)
        .setVersion('1.0')
        .addTag(appName)
        .build();

    const options: SwaggerDocumentOptions = {
        operationIdFactory: (
            controllerKey: string,
            methodKey: string
        ) => methodKey
    };
    const documentFactory = () => SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('docs/api', app, documentFactory);
}
