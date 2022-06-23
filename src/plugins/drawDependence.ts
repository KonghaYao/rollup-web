import type { Plugin } from "rollup-web";
import { ModuleTree, ModuleTreeLeaf } from "./drawDependence/types";
import { ModuleMapper } from "./drawDependence/module-mapper";
import { addLinks, buildTree } from "./drawDependence/data";
import { Buffer } from "buffer";
import { cache } from "./drawDependence/cache";
function ModuleLengths({
    id,
    renderedLength,
    code,
}: {
    id: string;
    renderedLength: number;
    code: string | null;
}) {
    return {
        id,
        renderedLength:
            code == null || code == ""
                ? renderedLength
                : Buffer.byteLength(code, "utf-8"),
    };
}

// 借鉴 rollup-plugin-visualizer 实现的模块关系导出
export const drawDependence = ({
    projectRoot = globalThis.location.href,
    /** 通过 log 可以对外暴露内部的 mapper ，从而监控依赖变化 */
    log,
    /** 保证异步载入的时候能够正常进行 mapper 缓存 */
    mapperTag = "default",
}: {
    projectRoot: string;
    log(mapperTag: string, mapper: ModuleMapper): void;
    mapperTag: string;
}) => {
    if (typeof mapperTag !== "string")
        throw "draw-dependence | mapperTag 需要输入一个字符串";
    return {
        name: "draw-dependence",
        async generateBundle(_, outputBundle) {
            const roots: Array<ModuleTree | ModuleTreeLeaf> = [];

            // 构建 Mapper
            let mapper: ModuleMapper;
            if (await cache.has(mapperTag)) {
                mapper = (await cache.get(mapperTag))!;
            } else {
                mapper = new ModuleMapper(projectRoot, mapperTag);
                cache.set(mapperTag, mapper);
            }

            Object.entries(outputBundle)
                // collect trees
                .map(([bundleId, bundle]) => {
                    if (bundle.type !== "chunk") return bundle; //only chunks

                    const modules = Object.entries(bundle.modules).map(
                        ([id, { renderedLength, code }]) =>
                            ModuleLengths({ id, renderedLength, code })
                    );

                    let tree = buildTree(bundleId, modules, mapper);

                    if (tree.children.length === 0) {
                        const bundleSizes = ModuleLengths({
                            id: bundleId,
                            renderedLength: bundle.code.length,
                            code: bundle.code,
                        });

                        const facadeModuleId =
                            bundle.facadeModuleId ?? `${bundleId}`;
                        const bundleUid = mapper.setNodePart(
                            bundleId,
                            facadeModuleId,
                            bundleSizes
                        );
                        mapper.setNodeMeta(facadeModuleId, {
                            isEntry: false,
                        });
                        const leaf: ModuleTreeLeaf = {
                            name: bundleId,
                            uid: bundleUid,
                        };
                        roots.push(leaf);
                    } else {
                        roots.push(tree);
                    }
                    return bundle;
                })
                .forEach((bundle) => {
                    if (
                        bundle.type !== "chunk" ||
                        bundle.facadeModuleId == null
                    )
                        return; //only chunks
                    addLinks(
                        bundle.facadeModuleId,
                        this.getModuleInfo.bind(this),
                        mapper
                    );
                });

            // 直接向外部暴露而不进行操作
            log(mapperTag, mapper);
        },
    } as Plugin;
};
