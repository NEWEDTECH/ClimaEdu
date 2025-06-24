import { ContentModule, InstitutionModule, UserModule } from "@/components/ModuleComponents";

export default function Test() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Test</h1>
      <div className="flex flex-col gap-4">
        <UserModule />
        <InstitutionModule />
        <ContentModule />
      </div>
    </div>
  )
}
