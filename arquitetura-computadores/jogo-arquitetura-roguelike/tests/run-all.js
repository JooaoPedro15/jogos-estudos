// Roda todos os testes (plain node, sem framework): node tests/run-all.js
import "./rng.test.js";
import "./mapgen.test.js";
import "./validate.test.js";
import "./answer.test.js";
import "./mastery.test.js";
import "./selection.test.js";
import "./resources.test.js";
import "./migrate.test.js";
import "./progression.test.js";
import "./engine.test.js";
import { summary } from "./_assert.js";

summary();
