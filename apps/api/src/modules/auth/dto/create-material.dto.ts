export class CreateMaterialDto {
    type!: "URL" | "TOPIC";
    title!: string;
    url?: string;
    topicText?: string;
}