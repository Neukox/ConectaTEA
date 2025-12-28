import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from "@nestjs/common";

@Injectable()
export class IdParamPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== "param") {
      return value;
    }

    const id = parseInt(value, 10);

    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(`Paramentro '${metadata.data}' inválido.`);
    }

    return id;
  }
}
