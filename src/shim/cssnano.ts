"use strict";
import path from "path";
import process from "process";
import postcss, { AcceptedPlugin } from "postcss";
import fs from "fs";
import require from "./require";
import type { Options } from "cssnano";

function isResolvable(moduleId: string) {
    try {
        path.resolve(moduleId);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * preset can be one of four possibilities:
 * preset = 'default'
 * preset = ['default', {}]
 * preset = function <- to be invoked
 * preset = {plugins: []} <- already invoked function
 *
 * @param {any} preset
 * @return {[import('postcss').PluginCreator<any>, boolean | Record<string, any> | undefined][]}}
 */
function resolvePreset(preset: any) {
    let fn, options;

    if (Array.isArray(preset)) {
        fn = preset[0];
        options = preset[1];
    } else {
        fn = preset;
        options = {};
    }

    // For JS setups where we invoked the preset already
    if (preset.plugins) {
        return preset.plugins;
    }

    // Provide an alias for the default preset, as it is built-in.
    if (fn === "default") {
        return require("cssnano-preset-default")(options).plugins;
    }

    // For non-JS setups; we'll need to invoke the preset ourselves.
    if (typeof fn === "function") {
        return fn(options).plugins;
    }

    // Try loading a preset from node_modules
    if (isResolvable(fn)) {
        return require(fn)(options).plugins;
    }

    const sugar = `cssnano-preset-${fn}`;

    // Try loading a preset from node_modules (sugar)
    if (isResolvable(sugar)) {
        return require(sugar)(options).plugins;
    }

    // If all else fails, we probably have a typo in the config somewhere
    throw new Error(
        `Cannot load preset "${fn}". Please check your configuration for errors and try again.`
    );
}

/**
 * cssnano will look for configuration firstly as options passed
 * directly to it, and failing this it will use lilconfig to
 * load an external file.

 * @param {Options} options
 */
function resolveConfig(options: Options) {
    if (options.preset) {
        return resolvePreset(options.preset);
    }

    let searchPath: string | undefined = process.cwd();
    let configPath: string | undefined = undefined;

    if (options.configFile) {
        searchPath = undefined;
        configPath = path.resolve(process.cwd(), options.configFile);
    }

    const config: { config: { preset: any } } | null = configPath
        ? JSON.parse(fs.readFileSync(configPath, "utf8"))
        : null;

    if (config === null) {
        return resolvePreset("default");
    } else {
        return resolvePreset(config.config.preset || config.config);
    }
}

function cssnanoPlugin(options: Options = {}): AcceptedPlugin {
    if (Array.isArray(options.plugins)) {
        if (!options.preset || !options.preset.plugins) {
            options.preset = { plugins: [] };
        }

        options.plugins.forEach((plugin) => {
            if (Array.isArray(plugin)) {
                const [pluginDef, opts = {}] = plugin;
                if (typeof pluginDef === "string" && isResolvable(pluginDef)) {
                    options.preset.plugins.push([require(pluginDef), opts]);
                } else {
                    options.preset.plugins.push([pluginDef, opts]);
                }
            } else if (typeof plugin === "string" && isResolvable(plugin)) {
                options.preset.plugins.push([require(plugin), {}]);
            } else {
                options.preset.plugins.push([plugin, {}]);
            }
        });
    }
    const plugins: AcceptedPlugin[] = [];
    const nanoPlugins = resolveConfig(options);
    for (const nanoPlugin of nanoPlugins) {
        if (Array.isArray(nanoPlugin)) {
            const [processor, opts] = nanoPlugin;
            if (
                typeof opts === "undefined" ||
                (typeof opts === "object" && !opts.exclude) ||
                (typeof opts === "boolean" && opts === true)
            ) {
                plugins.push(processor(opts));
            }
        } else {
            plugins.push(nanoPlugin);
        }
    }
    return postcss(plugins);
}

cssnanoPlugin.postcss = true;
export default cssnanoPlugin;
