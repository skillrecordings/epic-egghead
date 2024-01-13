import { serve } from "inngest/remix";
import {inngestConfig} from "#app/inngest/inngest.config.ts";

const handler = serve(inngestConfig);

export { handler as action, handler as loader };