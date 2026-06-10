import { Module } from "@nestjs/common";
import { MaterialIndexService } from "./material-index.service";
import { MaterialIndexController } from "./material-index.controller";

@Module({
	providers: [MaterialIndexService],
	controllers: [MaterialIndexController],
	exports: [MaterialIndexService],
})
export class MaterialIndexModule {}
