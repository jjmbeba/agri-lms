import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ModuleForm from "./module-form";

type CreateModuleBtnProps = {
  showText?: boolean;
};

const CreateModuleBtn = ({ showText = true }: CreateModuleBtnProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          {showText && "Add Content"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Module</DialogTitle>
        </DialogHeader>
        <ModuleForm />
      </DialogContent>
    </Dialog>
  );
};

export default CreateModuleBtn;
