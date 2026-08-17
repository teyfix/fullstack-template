import { compile } from "@inlang/paraglide-js";

import { paraglideOptions } from "../src/app/i18n/paraglide.config";

if (import.meta.main) await compile(paraglideOptions);
