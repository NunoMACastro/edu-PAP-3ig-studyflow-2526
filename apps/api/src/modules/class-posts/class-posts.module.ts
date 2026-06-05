// apps/api/src/modules/class-posts/class-posts.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { ClassPostsController } from "./class-posts.controller";
import { ClassPostsService } from "./class-posts.service";
import { ClassPost, ClassPostSchema } from "./schemas/class-post.schema";

@Module({
    imports: [
        ClassesModule,
        MongooseModule.forFeature([{ name: ClassPost.name, schema: ClassPostSchema }]),
    ],
    controllers: [ClassPostsController],
    providers: [ClassPostsService],
})
export class ClassPostsModule {}