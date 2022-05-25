import type { Plugin } from "rollup-web";
import { ModuleTree, ModuleTreeLeaf } from "./drawDependence/types";
import { ModuleMapper } from "./drawDependence/module-mapper";
import { addLinks, buildTree } from "./drawDependence/data";
import { Buffer } from "buffer";
const ModuleLengths = async ({
    id,
    renderedLength,
    code,
}: {
    id: string;
    renderedLength: number;
    code: string | null;
}) => {
    return {
        id,
        renderedLength:
            code == null || code == ""
                ? renderedLength
                : Buffer.byteLength(code, "utf-8"),
    };
};
export const MapperStore = new Map<string, ModuleMapper>();

// 借鉴 rollup-plugin-visualizer 实现的模块关系导出
export const drawDependence = ({
    projectRoot = window.location.href,
    /** 通过 log 可以对外暴露内部的 mapper ，从而监控依赖变化 */
    log,
    /** 保证异步载入的时候能够正常进行 mapper 缓存 */
    mapperTag,
}: {
    projectRoot: string;
    log(mapperTag: string, mapper: ModuleMapper): void;
    mapperTag: string;
}) => {
    if (typeof mapperTag !== "string")
        throw "rollup | draw-dependence | mapperTag 需要输入一个字符串";
    return {
        name: "draw-dependence",
        async generateBundle(_, outputBundle) {
            const roots: Array<ModuleTree | ModuleTreeLeaf> = [];
            let mapper: ModuleMapper;
            if (MapperStore.has(mapperTag)) {
                mapper = MapperStore.get(mapperTag)!;
            } else {
                mapper = new ModuleMapper(projectRoot, mapperTag);
            }

            // collect trees
            for (const [bundleId, bundle] of Object.entries(outputBundle)) {
                if (bundle.type !== "chunk") continue; //only chunks

                let tree: ModuleTree;

                const modules = await Promise.all(
                    Object.entries(bundle.modules).map(
                        ([id, { renderedLength, code }]) =>
                            ModuleLengths({ id, renderedLength, code })
                    )
                );

                tree = buildTree(bundleId, modules, mapper);

                if (tree.children.length === 0) {
                    const bundleSizes = await ModuleLengths({
                        id: bundleId,
                        renderedLength: bundle.code.length,
                        code: bundle.code,
                    });

                    const facadeModuleId =
                        bundle.facadeModuleId ?? `${bundleId}-unknown`;
                    const bundleUid = mapper.setNodePart(
                        bundleId,
                        facadeModuleId,
                        bundleSizes
                    );
                    mapper.setNodeMeta(facadeModuleId, { isEntry: true });
                    const leaf: ModuleTreeLeaf = {
                        name: bundleId,
                        uid: bundleUid,
                    };
                    roots.push(leaf);
                } else {
                    roots.push(tree);
                }
            }
            for (const [, bundle] of Object.entries(outputBundle)) {
                if (bundle.type !== "chunk" || bundle.facadeModuleId == null)
                    continue; //only chunks
                addLinks(
                    bundle.facadeModuleId,
                    this.getModuleInfo.bind(this),
                    mapper
                );
            }

            // 直接向外部暴露而不进行操作
            log(mapperTag, mapper);
        },
    } as Plugin;
};
