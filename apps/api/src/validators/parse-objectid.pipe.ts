import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
	transform(value: any) {
		if (!value) throw new BadRequestException("ObjectId is required");
		if (!Types.ObjectId.isValid(value)) {
			throw new BadRequestException("Invalid ObjectId");
		}
		return value;
	}
}
