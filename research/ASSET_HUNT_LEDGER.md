# NAHLATY — GLOBAL ASSET INTELLIGENCE LEDGER

Research date: **2026-10-09 (UTC)**. Status: **research delivery; acquisition not yet executed at scale**.
Owner: NAHLATY Global Asset Acquisition. Target: 1,000,000+ diverse, meaningful visual scenes.
Scope: reusable content only. Existing React/Next.js interactive vector runtime remains the destination, not a replacement target.
Branch: `research/asset-hunt-ledger`. This update changes this document only; no runtime, application, deployment, or main-branch changes.

## Operating rules retained

- Research only on this branch; never modify the runtime, deploy, merge, or alter main.
- Separate VERIFIED / ESTIMATED / UNKNOWN; raw files are not completed scenes.
- Record source/demo/license/format/count/semantics/integration evidence; report material findings.
- Commit the ledger to this branch and open/update a draft PR for review only.

## Executive acquisition decision

**Adopt a rights-filtered, deduplicated portfolio, not a single marketplace subscription.**

1. **Scale discovery backbone:** Wikimedia Commons + Objaverse-XL + Smithsonian Open Access. These expose very large multidisciplinary inventories; eligible, distinct educational coverage is NOT their headline file count.
2. **First assets to normalize into the existing vector runtime:** WikiPathways + Bioicons + selected Commons SVGs. They provide editable geometry; pathway data supplies scientific identifiers and relationships.
3. **Scientific depth:** BodyParts3D + RCSB PDB, then Reactome/AlphaFold and selected NIH 3D. Keep experimental observations separate from predictions.
4. **Cinematic support:** NASA SVS and Poly Haven. Video, material, lighting and background assets improve scenes but do not add independent lesson counts.
5. **Optional ready-made interaction:** Javalab permits commercial embedding with citation. It cannot be cloned or treated as native runtime content. GeoGebra/PhET/BioDigital/Mozaik remain negotiated-content lanes, not approved bulk suppliers.

**Million-asset access: supported by source inventories. Million commercially cleared, deduplicated, meaningful interactive scenes: NOT YET VERIFIED.** Zero completed NAHLATY scenes were produced or counted in this research. No supplier purchases or outreach were made.

## Evidence and counting rules

- **VERIFIED-MEASURED (V-M):** HTTP response or downloaded file parsed during this investigation.
- **VERIFIED-PUBLISHED (V-P):** an explicit statement on the source's own page/repository. This verifies the published statement, not a full independent inventory audit.
- **ESTIMATED (E):** planning assumption, with basis stated. Not a procurement commitment.
- **UNKNOWN (U):** not established; excluded from any approved-total claim.
- A model, texture, atom, image, language translation, camera angle, download format, resolution or parameter value is not automatically a scene.
- A **subject** is a canonical entity/process; a **scene** also needs a distinct learning objective, evidence-backed behavior, usable interaction, and QA acceptance.
- Asset count, unique entity count, unique subject count and accepted scene count are separate fields.
- License of repository code != license of assets; open download != commercial permission; commercial display != editable-asset redistribution.
- Read-only review included source pages, APIs, raw SVG/GLTF/CIF/GeoJSON, semantic tables and two visual previews. No third-party interactive demo was browser-actuated; no React integration/performance result is claimed.

## Ranked acquisition ledger

Rank balances broad useful coverage, rights clarity, automation, semantics and fit to the existing runtime. A lower-ranked small semantic collection can have greater immediate value than millions of anonymous meshes. Cost excludes our processing, storage, QA and delivery.

| Rank | Collection / evidence | Inventory and counting unit | Unique coverage / overlap | Rights and ownership | Format, semantics, acquisition | Runtime fit / cost / decision |
|---|---|---|---|---|---|---|
| 1 | [Wikimedia Commons](https://wikimediafoundation.org/what-we-do/wikimedia-projects/commons/) | **100M+ media V-P**, not 100M SVGs. Relevant SVG count U. One heart SVG parsed, see S2. | Broad science, engineering, geography, biology; subject count U. Many translations, derivatives and museum mirrors. | Per-file PD/CC and other licenses. BY needs attribution; BY-SA adaptations retain applicable share-alike obligations. Ownership stays with creators. | SVG, raster, video, audio, some 3D. [API](https://www.mediawiki.org/wiki/API:Imageinfo); file-page author/source/license required. Some SVGs already have meaningful IDs. | SVG: medium cleanup; raster: high conversion burden. $0 eligible assets. **Primary broad discovery lane**, not blanket bulk approval. |
| 2 | [Objaverse-XL](https://github.com/allenai/objaverse-xl) | **10M+ objects V-P**, research-release inventory, not current accessible-download count. | Broad everyday objects/engineering/environments. Includes Sketchfab, GitHub, Thingiverse, Smithsonian and Polycam; never add those totals again. Unique topics U. | Database ODC-By; individual object licenses vary. Polycam subset explicitly non-commercial approval-only. Apache code license does not clear objects. | Download/processing scripts; heterogeneous 3D formats, captions, some rigs/parts/animations. Semantic coverage U. | High; a GLB cannot go directly into an SVG runtime. $0 eligible subset, conversion/storage extra. **Largest 3D discovery index; strict per-object gate.** |
| 3 | [Smithsonian Open Access](https://www.si.edu/openaccess) | **5.2M+ 2D/3D digital items V-P**, overwhelmingly not five million 3D models. 3D-only count U. | Natural history, fossils, specimens, instruments, aviation, culture. Commons/Objaverse/GBIF overlap. | [CC0-designated items only](https://www.si.edu/openaccess/faq); commercial adaptation/redistribution allowed without required attribution. Non-CC0 items have separate conditions. | JPG/TIFF, GLTF/GLB/OBJ, Voyager scenes, JSON/IIIF. [3D API](https://3d-api.si.edu/api-docs/) offers format/quality filters. | Medium-high; excellent metadata and credible objects. $0 CC0 content; low asset lock-in. **Preferred museum origin over its mirrors.** |
| 4 | [WikiPathways](https://github.com/wikipathways/wikipathways-database) | **2,223 GPML files / 2,219 pathway directories V-M**, untruncated current repo tree. These differ; neither is automatically unique biology. | Biological processes and molecular interactions; overlaps Reactome/PubChem/PDB entities. | [CC0 repository](https://github.com/wikipathways/wikipathways-database); retain provenance scientifically. | GPML/XML plus [SVG releases](https://data.wikipathways.org/current/svg/). WP554 parsed: 157 groups, 306 IDs. Biological mapping still needs GPML, not arbitrary SVG IDs alone. | Low-medium. $0; self-hostable files. **Best measured native-vector semantic acquisition pilot.** |
| 5 | [RCSB / wwPDB](https://www.rcsb.org/statistics) | **261,031 released entry IDs V-M** from holdings endpoint. Repeated proteins/ligands/conformations are not unique subjects. | Experimental macromolecular structures. Protein sequence, complex and ligand clustering needed; PDB mirrors are same corpus. | [Archive/API data CC0](https://www.rcsb.org/pages/usage-policy). Illustrations/articles have different conditions. | PDBx/mmCIF, PDB, API JSON; chains, residues, atoms, ligands, assemblies. 4HHB file tested. | Medium-high: derive educational vector views offline; full molecular 3D is not native SVG. $0 data. **Best high-volume scientific semantics.** |
| 6 | [BodyParts3D, Japan](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) | **1,368 unique concept/representation rows V-M** in PART-OF list; IS-A list has 2,906 lines including header. Not all are separately supplied mesh files. | One anatomical atlas with nested/compound organs, not thousands of independent bodies. FMA hierarchy supplies concrete coverage. Z-Anatomy/Anatomography overlap. | [Current official license CC BY 4.0](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html). Older archives/mirrors carry CC BY-SA 2.1 JP; pin the actual version/license. | OBJ and FMA-ID/name/IS-A/PART-OF tables. Compound organs can be defined by combinations of elements. | Medium-high. $0; semantic source for cutaways/layers and projected vector anatomy. **Priority anatomy acquisition.** No premium-heart pass claimed. |
| 7 | [Bioicons](https://bioicons.com/) | **2,829 icons V-P** on live catalog; repo contains **2,836 SVGs V-M including auxiliary files**; **2,830 under `static/icons/` V-M**. Catalog/repo differ by snapshot, so preserve both counts. | Lab objects, cells, organs and molecules. Includes Servier-derived assets; subtract overlap. | Per-icon CC0/BY/BY-SA/MIT etc; inspect license directory and author. Site-code MIT is not universal artwork licensing. | Raw SVG in [source repo](https://github.com/duerrsimon/bioicons); directory encodes license/category/author. | Low-medium. $0; select science components, not generic icon filler. **Fast building blocks**, not finished premium scenes. |
| 8 | [NASA SVS](https://svs.gsfc.nasa.gov/help/) | **10,590 search results V-M** at API request; includes videos/visualizations and other indexed pages, not 10,590 interactive scenes. | Astronomy, Earth, climate, missions. Versions/language variants/frames overlap; other NASA mirrors duplicate. | Public domain unless noted; third-party music exceptions; NASA usage guidelines apply. | MP4/WebM, images, frame sequences; free search/page JSON APIs and provenance/dataset metadata. | Low for existing supported media use; high for semantic vector reconstruction. $0 eligible content. **Strong scientific motion/reference lane.** |
| 9 | [NIH 3D](https://3d.nih.gov/) | **12,000+ assets V-P**; no independent current census. | Molecular, anatomical, pathogen/medical devices; PDB/Smithsonian overlap. | [Per-entry licenses](https://3d.nih.gov/terms), not blanket public domain merely because NIH hosts it. | Downloadable 3D; [collections](https://3d.nih.gov/collections) include NIAID expert content. Public bulk API contract U. | Medium-high; segmentation varies. $0 for approved open items. **Curated scientific subset**, not unrestricted bulk ingest. |
| 10 | [Reactome](https://reactome.org/download-data/) | Current pathway count U in this pass; do not reuse old release counts. | Curated reaction/pathway graphs; high overlap with molecular entities but distinct causal relationships. | [Data CC0; pathway illustrations/art CC BY 4.0](https://reactome.org/license). Third-party viewer components separately licensed. | Content Service API, pathway graph/exports, biological identifiers. [Glycolysis sample](https://reactome.org/content/detail/R-HSA-70171) opened. | Medium; map graph/layout to existing semantic state. $0 eligible exports. **Process semantics, not a new viewer.** |
| 11 | [AlphaFold DB](https://www.ebi.ac.uk/pdbe/news/alphafold-database-release-notes) | **241M+ predictions V-P** in release note; older 214M snapshot is not additive. Current site also uses rounded 200M+ headline. | Huge sequence coverage, much narrower conceptual diversity; homologs/fragments collapse heavily. | [CC BY 4.0 commercial use](https://www.alphafold.ebi.ac.uk/download). Predictions must carry confidence/provenance. | CIF/PDB/bCIF + confidence/PAE metadata; bulk/FTP/API. | High for meaningful educational adaptation. $0 data, substantial bulk costs. **Long-tail structure fallback, not a million-topic shortcut.** |
| 12 | [PubChem](https://pubchem.ncbi.nlm.nih.gov/docs/statistics) | **124,663,543 compounds V-P**, source date 2026-09-06; 118 elements. Compounds differ from substance submissions. | Chemistry; salts, stereoisomers and near-identical structures need educational grouping. | [Contributor-specific conditions](https://pubchem.ncbi.nlm.nih.gov/docs/downloads); do not classify every annotation as CC0. | SDF/structure data, JSON and depictions via [PUG services](https://pubchem.ncbi.nlm.nih.gov/docs/programmatic-access). Atom/bond structure is useful semantics. | Medium for vector depictions; $0 access; ≤5 requests/sec published policy, prefer bulk. **License-filtered chemistry lane.** |
| 13 | [Natural Earth](https://www.naturalearthdata.com/downloads/) | **177 country features V-M** in sampled 110m GeoJSON; total multi-theme feature count U. Scales duplicate subjects. | Countries, rivers, terrain and boundaries; genuinely different places, but political/geographic learning objectives still needed. | [Public domain](https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md), commercial redistribution allowed. | SHP/GeoPackage/SQLite; repo GeoJSON, feature names/codes; vector path conversion. | Low-medium. $0; low lock-in. **Best simple geography foundation.** |
| 14 | [Servier Medical Art](https://smart.servier.com/smart_image/) | **3,020 illustrations V-P**. | Anatomy, physiology, disease and medical procedures; subset mirrored in Bioicons/Commons. | [Current source CC BY 4.0](https://smart.servier.com/); credit and modifications notice. Older copies can have different license labels. | PNG/PPTX category kits; test vector editability per PPTX, never assume every image is SVG. | Medium; $0. **Useful medical components**, limited cinematic quality. |
| 15 | [MorphoSource](https://github.com/MorphoSource/morphosource-api) | Current media/specimen count U; no guessed headline admitted. | Fossils, organisms, CT-derived internal structure, cultural objects. Physical specimen != scan != derived mesh. | Item-level licenses/permissions; downloads may require account or approval. Repository AGPL is platform code, not media rights. | 3D/2D/volumes; REST search, media, physical-object and download endpoints; specimen ontology. | High for CT segmentation/mobile simplification. $0 where authorized; lock-in low for downloaded open files. **Deep biodiversity/inside views.** |
| 16 | [GBIF multimedia](https://techdocs.gbif.org/en/data-publishing/multimedia-publishing) | Image-bearing occurrence count U; billions of occurrences must not be counted as images or scenes. | Biodiversity/agriculture; species IDs useful. Multiple photos per specimen and Smithsonian/iNaturalist mirrors overlap. | Media license can differ from occurrence license; filter each media URL. CC BY-NC excluded from commercial lane. | Occurrence API and publisher-hosted image/video/audio URLs. Semantic taxonomy, usually no object segmentation. | Medium-high for interactive visual derivation. $0 eligible media. **Taxonomic breadth, not native vector.** |
| 17 | [Poly Haven](https://polyhaven.com/license) | **2,385 assets V-M: 521 models, 997 HDRIs, 867 textures**. Do not count each map/resolution as another asset. | Mostly environment/material/prop coverage, not scientific systems. S3 sample is one unsegmented chair. | Assets CC0; [live API terms](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md) require identifying header and visible source credit. Downloaded CC0 assets differ from API-service conditions. | GLTF/Blend/FBX/USD, PBR, HDRIs; metadata/files API tested. | Medium for existing compatible 3D workflows, not direct SVG. $0 API/assets under current terms. **Visual-quality support only.** |
| 18 | [BioImage Archive](https://www.ebi.ac.uk/bioimage-archive/help-faq/) | Image/volume count U; bytes/frames/studies are different units. | Cells/tissues/organisms, sometimes segmentation masks and spatial annotations. | [New direct deposits CC0 or CC BY 4.0](https://www.ebi.ac.uk/bioimage-archive/help-policies/); imported datasets may differ. | Scientific raster/volumes; BioStudies accession/file access; large files and format conversion. | High; $0 access, high processing/storage. **Selective microscopy lane**, not bulk scene count. |
| 19 | [BioModels](https://www.ebi.ac.uk/training/online/courses/biomodels-quick-tour/what-is-biomodels/) | Current model count U; curated/un-curated/models generated by pipelines must be distinguished. | Quantitative biological behavior; reaction equations, parameter effects, reproduction references. | Official training describes models as CC0. Check accession and current service after migration. | SBML/CellML and other formats; not ready visual artwork. | High; $0 data. **Behavior evidence for existing scenes**, not renderer or assumed simulation compatibility. |
| 20 | [NASA 3D Resources](https://science.nasa.gov/3d-resources/) | **1,199 repo blobs V-M**, NOT 1,199 models (textures/previews/multiple formats included). Unique models U. | Spacecraft, planetary/mission objects; complements SVS, overlaps Commons/Objaverse. | [Repo](https://github.com/nasa/NASA-3D-Resources) describes assets as free/no copyright; NASA media rules and third-party notices apply. | Mixed model formats, textures and previews; git/download access. | Medium-high; $0 eligible files. **Mission-specific 3D acquisitions.** |

### Additional engineering acquisition candidate — ABC CAD

[ABC Dataset](https://deep-geometry.github.io/abc-dataset/) publishes **1 million CAD models (V-P, 2019 release)** with STEP/Parasolid, separated STL parts, surfaces/curves, feature descriptions and some original FeatureScript. This is a material procedural/engineering source beyond generic textured meshes. The catalog supplies downloadable chunks and checksums; no scene-control API. Unique mechanical concepts U; many CAD shapes are not identified machines. Integration high: offline geometry conversion and semantic annotation, not a runtime replacement. Source files are free to access; CAD conversion and validation costs U. Rights stay with original creators. [Onshape public-document terms](https://www.onshape.com/en/legal/terms-of-use) grant broad reuse for qualifying documents but preserve some LICENSE-tab reservations and distinguish service access rules. **Conditional priority 21: verify each document provenance/license and use authorized dataset downloads; do not scrape Onshape or assume all one million are commercially cleared.** Published page activity is old; current download availability was not bulk-tested.

## Commercial, global and under-discovered lanes

These are evaluated collection opportunities, not extra quantities added to the approved corpus.

| Collection / country or ecosystem | Verified discovery / count | Rights, API, export and runtime implications | Procurement verdict |
|---|---|---|---|
| [Javalab, South Korea](https://javalab.org/ko/about/) | About **400 simulations V-P**; [gear demo](https://javalab.org/en/gear_en/) page inspected, controls described, not operated. Physics/chemistry/astronomy/biology. | [Policy](https://javalab.org/en/copyright-policy/) explicitly allows commercial iframe embedding and captures with title+URL citation, but prohibits cloning HTML/CSS/JS; embed reliability not guaranteed. No state API proven. | **Material discovery:** free supplementary interaction, medium integration/low ownership. Cannot become a native semantic asset by scraping source. |
| [GeoGebra, Austria/global](https://www.geogebra.org/about) | **1M+ classroom resources V-P**, not 1M distinct interactive lessons. | [Commercial license required](https://www.geogebra.org/license) for product/materials; community provenance matters. EUPL code exception does not clear entire content catalog. Exported static SVG would lose applet behavior. | **Largest near-ready education catalog, RIGHTS-GATED.** Commercial price and unique yield U; negotiate only if later authorized. |
| [PhET, US/global](https://phet.colorado.edu/en/licensing) | Current simulation count U; language variants excluded. | Current official indexed licensing says regular HTML files CC BY-NC 4.0 and commercial agreement needed. Older CC BY/help/GPL pages conflict by version. Open fetch was JS shell, so retain this retrieval limitation. | **HOLD commercial ingestion.** Strong behavior, no assumption of free product reuse; no new engine proposed. |
| [BioDigital](https://pricing.biodigital.com/business.html) | **1,000+ full-library models V-P**; 500+ A&P tier is a subset, not additive. | [JS viewer/API](https://developer.biodigital.com/), anatomy hierarchy and hosted models; raw mesh export/white-label ownership U. Commercial price quote; views/users can be metered. | **Premium content partnership only.** High supplier dependence; not a native vector drop-in. |
| [CGTrader, Lithuania/global](https://www.cgtrader.com/) | **2M+ models V-P**. Multi-format/creator cross-list overlap. | [API docs](https://www.cgtrader.com/docs/index.html), OAuth access, model/license endpoints. [Subscription rules](https://www.cgtrader.com/pages/subscription-fair-use-policy) restrict redistribution and include No-AI conditions. Homepage advertises 25 models/month from $9.99; this is not a bulk platform embedding license. | **Targeted gap purchases only**, export/rig quality per asset; production rights/pricing U. |
| [Fab](https://www.fab.com/o/about) | Total relevant assets U; do not add legacy Sketchfab/Quixel libraries again. | [EULA](https://www.fab.com/eula) permits project use subject to terms, prohibits standalone redistribution; CC BY assets have own terms. Bulk acquisition API U. | **Selective content**, prices item-specific; not an unrestricted scene factory. |
| [Mozaik / mozaWeb, Hungary](https://www.mozaweb.com/en_US/mozaik3D) | **1,300+ interactive 3D scenes V-P**; catalog has anatomy/mechanics/geography/history. | Classroom subscriptions prove viewing, not OEM export/white-label/runtime ownership. API, raw scene export and redistribution rights U; OEM cost quote. | **Partnership lead**, strong reference quality; not bulk ingest approved. |
| [InternScenes, China](https://github.com/InternRobotics/InternScenes) | **~40,000 scenes, 1.96M object instances, 288 object classes, 15 scene types V-P**. This does NOT mean 1.96M unique assets. | CC BY-NC-SA 4.0; GLB and layouts with semantics; source assets include Objaverse/HSSD/3D-FUTURE/PartNet-Mobility. July 2025 release documented. | **Exclude commercial corpus.** Important negative result and dedup trap; research reference only. |
| [PartNet](https://github.com/daerduoCarey/partnet_dataset) / PartNet-Mobility | PartNet: **26,671 models, 573,585 part instances, 24 categories V-P**. Do not transfer these numbers to Mobility. | Repo LICENSE is MIT software wording; underlying ShapeNet/source geometry clearance is a separate question. Mobility has distinct terms. Part segmentation and joints valuable, commercial asset clearance U. | **HOLD**, not blanket MIT asset acquisition. High semantic value, narrow categories. |
| [Korea National Heritage Digital Service evidence](https://www.korea.kr/news/reporterView.do?newsId=148967979) | Korean government article documents 3D assets, some >2GB; current collection count U. | Article describes agency-owned files under KOGL Type 1 (commercial adaptation with attribution). Verify individual file badge; not every KOGL type permits commerce or edits. API/export inventory U. | **Global long-tail lead**: architecture/craft/history; high simplification cost. |
| [Stratum, Russia](https://stratum.ac.ru/ru/products/physics.php) | **5,000+ physics projects V-P**, explicitly mixes trainers/tests/models/labs. | Paid licensed collection; web-export/API, sublicensing and modern browser compatibility U. No code copied. | **Legacy adaptation lead**, not 5,000 ready scenes; quote/technical sample needed. |
| [SVG Repo](https://www.svgrepo.com/) | **500,000+ SVGs, 6,000+ collections V-P**. Huge icon/style duplication. | [Per-license rules](https://www.svgrepo.com/page/licensing/); source-author license controls; homepage links an Icon API, but bulk service rights unverified. | **Supporting components only**. Never book 500k educational subjects. |
| [Openverse](https://openverse.org/kin/about) / [Europeana](https://api.europeana.eu/en) | Openverse **800M+ image/audio indexed works V-P**; current Europeana count U. | [Openverse API](https://api.openverse.org/v1/); [Europeana object rights](https://www.europeana.eu/en/stories/learn-how-to-reuse-europes-digital-cultural-heritage). NC/ND and restrictive items require exclusion. | **Discovery federators**, counted as zero additional inventory until canonical-origin dedup. |
| [ambientCG](https://ambientcg.com/) | Current independent count U. PBR/material library, not science lessons. | [CC0 assets](https://docs.ambientcg.com/license/); API/bulk service reliability must be assessed separately. | **Material support**, no scene multiplier. |
| [LottieFiles](https://help.lottiefiles.com/animation-licensing-basics-) | Relevant scientific animation count U; no headline total used. | Free animations under Lottie Simple License permit commercial project use/modification, but prohibit standalone redistribution and compiling/scraping a competing service. Authoring-plan rights differ; [terms](https://lottiefiles.com/page/terms-and-conditions) must be checked for acquisition path. JSON/vector animation is not a simulation or anatomical semantic graph. | **Selective licensed animation only**, not bulk reusable factory or replacement runtime. |
| [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) | Repo reachable/not archived; nine repository blobs are packages, NOT nine anatomy parts. | Derivative anatomy lineage and asset-specific share-alike/third-party notices must be retained. Current root push date measured below. | **BodyParts3D enrichment candidate**; do not count as an entirely independent atlas. |

## Real sample inspections and reproducible evidence

All retrievals below were made on 2026-10-09. Samples are purposive compatibility probes, NOT statistically representative samples for estimating corpus acceptance rates. Downloaded sample files stayed outside the repository.

| Probe | Direct sample / query | Observed result | Meaning and limitation |
|---|---|---|---|
| S1 | [WikiPathways WP554 SVG](https://www.wikipathways.org/wikipathways-assets/pathways/WP554/WP554.svg), [PNG preview](https://www.wikipathways.org/wikipathways-assets/pathways/WP554/WP554.png) | HTTP download and XML parse: 98,127 bytes; 157 `g`, 52 `path`, 37 `text`, 31 `a`, 306 IDs; no `image` elements. PNG opened visually. | True editable vector, directional relationships and labels; renal/adrenal/vascular signaling diagram. Scientific schematic, **not cinematic artwork**. IDs include rendering infrastructure; need GPML matching. HTML pathway page returned 403 in web reader while assets downloaded successfully. |
| S2 | [Commons heart source page](https://commons.wikimedia.org/wiki/File:Heart_chambers_and_valves_schematic.svg), [raw SVG](https://upload.wikimedia.org/wikipedia/commons/d/d0/Heart_chambers_and_valves_schematic.svg) | Parsed 7 groups, 20 paths, 18 text nodes; IDs include `Aortic_valve`, `Pulmonary_valve`, `Mitral_valve`, `Tricuspid_valve`, `Pulmonary_veins`, `Aorta`, chamber fragments. Page license CC BY-SA 4.0. | **Semantic SVG already exists**, contrary to assuming all vectors require segmentation. Not a premium anatomy acceptance. Fragment IDs need mapping into existing chamber semantics. |
| S3 | [Poly Haven assets API](https://api.polyhaven.com/assets), [chair files](https://api.polyhaven.com/files/ArmChair_01), [GLTF](https://dl.polyhaven.org/file/ph-assets/Models/gltf/4k/ArmChair_01/ArmChair_01_4k.gltf) | Parsed inventory: 2,385 (types 2/0/1: 521/997/867). Chair GLTF: **one node, one mesh, zero animations**, name `ArmChair_01`. Files endpoint lists GLTF/Blend/FBX/USD/PBR. Thumbnail viewed. | Good textured realism does not imply semantic parts, movement or scientific function. No full 3D interactive rendering performed. |
| S4 | [BodyParts3D PART-OF table](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_parts_list_e.txt), [IS-A table](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_parts_list_e.txt) | PART-OF: 1,369 lines including header; **1,368 unique FMA IDs and representation IDs**. Examples: heart `FMA7088/BP9305`, right atrium `FMA7096/BP9831`, left atrium `FMA7097/BP9454`. IS-A 2,906 lines including header. | Ontology-linked semantics confirmed. Tables include compound definitions; no claim that every row is an independent OBJ. Full geometry pack not downloaded. |
| S5 | [PDB holdings](https://data.rcsb.org/rest/v1/holdings/current/entry_ids), [4HHB page](https://www.rcsb.org/structure/4HHB), [CIF](https://files.rcsb.org/download/4HHB.cif) | Holdings list 261,031 IDs. 4HHB: 772,198 bytes and **4,779 ATOM/HETATM rows**; source page identifies human deoxyhemoglobin and chains/HEM. | Atomic/residue/chain semantics real. Static coordinates do not prove oxygen-binding animation or a quantitative simulation. |
| S6 | [Natural Earth countries GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson) | 838,726 bytes; **177 features** parsed. | Country polygons are ready for vector projection and per-feature IDs; these are dataset features, not a statement about universally recognized country count. |
| S7 | [NASA SVS search API](https://svs.gsfc.nasa.gov/api/search/?limit=1), [SST demo](https://svs.gsfc.nasa.gov/5101/) | JSON `count=10590`; newest result returned has release date 2026-10-07. API documentation includes source/alternate-version metadata. | Count is indexed records, not distinct animated phenomena. Reuse version relationships for dedup; no video playback test. |
| S8 | [Javalab gear](https://javalab.org/en/gear_en/), [reuse terms](https://javalab.org/en/copyright-policy/) | Public page exposes controls and describes radius/torque/speed behavior; commercial iframe permission explicit. | Page/document inspection only. Runtime state bridge, reliability, accessibility and mobile behavior remain U. |

Sample SHA-256 anchors (re-download if source changes):

- WP554 SVG: `929881d38c5fb257446abfdedf1324a9675752af258d714e3b3298c98acfdecb`
- BodyParts3D PART-OF table: `9224080557053e6f1322f1e13ab27f0ecde0db19bb3b505f0631afad230eeebd`
- 4HHB CIF: `2d3ca1bf21ddff35af2e2bc5d331720f7bfc46a16c4829ea3ec1b41062d5f5a6`
- Natural Earth sample: `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`

Counting method: JSON list length for holdings; dictionary keys for Poly Haven; untruncated GitHub recursive-tree entries ending in `.gpml`/`.svg`; XML element/ID enumeration; TSV header excluded; GeoJSON `features` length. These are snapshot measurements, not contractual supplier volumes.

### Maintenance evidence

GitHub repository metadata/recursive trees were requested via `https://api.github.com/repos/{owner}/{repo}` and `/git/trees/{default_branch}?recursive=1`. Trees used here reported `truncated=false`.

| Repository | `pushed_at` measured | Archive flag | Interpretation |
|---|---|---|---|
| wikipathways/wikipathways-database | 2026-10-06T10:18:25Z | false | Recent source activity; not proof every pathway is current. |
| duerrsimon/bioicons | 2026-10-08T16:10:30Z | false | Recent activity; catalog/repo count discrepancy retained. |
| nasa/NASA-3D-Resources | 2025-06-03T16:01:14Z | false | Slow-changing source repository; NASA web collections may differ. |
| allenai/objaverse-xl | 2024-08-27T17:45:06Z | false | Mature research snapshot, not an actively refreshed asset guarantee. |
| Z-Anatomy/Models-of-human-anatomy | 2026-10-08T22:33:43Z | false | Recent repo activity; content/version rights still need package inspection. |

Other sources: institution continuity is favorable evidence, not an SLA. Last content update/asset freshness U unless a dated release or sample above establishes it. Search crawl date is not maintenance activity.

## Deduplication and unique coverage

### Overlap map — do not add these headline inventories

- **Objaverse-XL contains/integrates Objaverse/Sketchfab, GitHub, Thingiverse, Smithsonian and Polycam.** Keep canonical original ID/URL; maintain the XL ID as an alias.
- **Openverse, Commons, Europeana and GBIF can point to the same institutional media.** Smithsonian is a preferred original when identified; no double addition for a mirror.
- **Bioicons / Servier / Commons:** actual Bioicons tree contains `static/icons/cc-by-3.0/Human_physiology/Servier/...`; current Servier source uses BY 4.0. Preserve per-version provenance instead of silently relabeling old copies.
- **BodyParts3D / Anatomography / Z-Anatomy / derivative viewers:** same anatomical lineage; enhanced derivatives may add useful parts, but only incremental additions count.
- **PDB / PDBe / PDBj / NIH molecular models / AlphaFold / PubChem / Reactome / WikiPathways:** cross-reference proteins, molecules and processes. A predicted and experimental structure may support comparison but are not automatically two subjects.
- **ABC/Onshape CAD variants and derived mesh benchmarks share source geometry**; do not count format conversions or derived training subsets again.
- **InternScenes object placements are not new models**; many assets come from existing corpora. PartNet annotations are not another 573,585 independent objects.
- **NASA:** frames, resolutions, cropped versions, languages and mirrors collapse to original visualization + learning objective.

### Required normalization fields (research specification, not implemented)

`origin`, `originId`, `version`, `canonicalUrl`, `license`, `licenseUrl`, `author`, `attribution`, `rightsCheckedAt`, `rawHash`, `geometryHash`, `visualHash`, `format`, `subjectIds`, `parts`, `animationClips`, `sourceAliases`, `commercialAllowed`, `redistributionAllowed`, `transformAllowed`, `qaStatus`.

Dedup order: exact hashes -> canonical origin/DOI/accession -> normalized SVG/mesh/texture signatures -> perceptual similarity -> domain IDs (FMA, UniProt, InChIKey, taxonomy, geography) -> learning-objective equivalence. Preserve clinically/scientifically meaningful differences; do not collapse all variants automatically. No corpus-wide dedup job was run in this research; the overlap map is source-level exclusion, not a measured unique total.

### Subject coverage estimates

These are **E: acquisition-planning envelopes**, not statistically estimated yields. Their basis is source breadth and the count of different concept families likely to merit curation; independent validated totals remain U. Ranges overlap and must not be summed as accepted subjects.

| Domain cohort | Initial plausible distinct subject envelope (E) | Basis / main uncertainty |
|---|---:|---|
| Commons + Smithsonian scientific diagrams/specimens/instruments | 20,000–100,000 | Large multidisciplinary pool; unknown scientific relevance, rights pass and duplicates. |
| Objaverse physical/technical objects | 10,000–75,000 | Large raw corpus but object-instance/style repetition and commercial clearance dominate. |
| Molecular structures/chemical mechanisms | 10,000–100,000 | Hundreds of millions of records, but family/function clustering and learning value reduce severely. |
| Anatomy/pathways/lab components | 2,000–10,000 | Measured small semantic collections; substantial hierarchy and cross-source overlap. |
| Biodiversity/agriculture visual subjects | 20,000–150,000 | Species-scale opportunity; actual licensed images and explanatory depth unmeasured. |
| Geography/astronomy/Earth processes | 5,000–30,000 | Places/phenomena/missions; geographic tiles and temporal frames excluded. |
| Licensed ready-made simulations | U | Contract scope plus dedup must be known before estimating usable yield. |

These ranges are intentionally hypotheses to test. A rigorous forecast requires stratified sampling, not multiplying the source homepage numbers.

## Strongest combinations toward one million meaningful scenes

### Combination A — recommended ownership-first portfolio

**Commons + Smithsonian + rights-cleared Objaverse subset**, enriched by **WikiPathways/BodyParts3D/PDB**, and selective NASA/GBIF content. Purchase only specific gaps. This is an acquisition portfolio, not a replacement software stack.

- Raw supply comfortably exceeds one million records (V-P/V-M above).
- Rights-cleared unique scientific subjects and transformation success rate: U.
- Attractive because licensed source files can be stored and versioned; no required per-view supplier fee for approved open assets.
- Conditional scale test, **E not forecast**: 250,000 genuinely distinct subjects × 4 validated learning objectives = 1,000,000 scenes. At 100,000 subjects × 3 objectives, the result is only 300,000. The 250,000-subject prerequisite has not been demonstrated.
- Do not count “Inside / Process / Cause-effect / Journey / Compare / Practice” mechanically six times per asset. Each must have distinct evidence and a user task.

### Combination B — licensed educational collections plus open long tail

GeoGebra commercial content agreement could supply the largest near-ready catalog; PhET/Mozaik/BioDigital offer narrower premium behavior. Complement with Combination A's open subjects. The GeoGebra headline crosses one million resources, but contract scope, duplication, pedagogical uniqueness and native-runtime adaptation are U. **Not counted toward owned native scenes.** Javalab is the clearest discovered commercial-embed allowance, at roughly hundreds, not millions.

### Combination C — molecular-data-heavy catalog

PDB + AlphaFold + selected PubChem structures could exceed a million entity-specific visualizations, subject to rights/format processing. **Reject as the main strategic answer:** massive sequence/compound counts can conceal weak cross-domain educational variety. Retain as a long-tail scientific capability, with domains and objective diversity reported separately.

### A scene can count only after these checks

Rights cleared; origin preserved; canonical subject/objective deduplicated; correct semantic parts; behavior supported by evidence; compatible with current runtime; visual/mobile QA passed; Arabic labels usable; no placeholder interaction. Report separate totals: discovered -> licensed -> deduplicated -> semantic-ready -> QA-passed -> published. Current research contribution to QA-passed/published scenes: **0**.

## Reuse into distinct educational scenes — examples, not completed assets

| Source subject | Distinct legitimate objectives | What must be added / not inferred |
|---|---|---|
| WP554 renin/angiotensin pathway | Trace a biochemical sequence; identify inhibition edges; compare two evidence-backed intervention paths. | Map GPML identifiers to SVG; annotate evidence. Do not invent quantitative drug response from a diagram. |
| BodyParts3D heart | Identify chambers; follow an independently verified blood route; compare selected anatomical views. | Accurate flow/valve behavior and labeled semantics. Static anatomy alone does not establish BPM/cardiac-output dynamics. |
| 4HHB hemoglobin | Inspect chains/heme; relate iron binding site to oxygen transport; compare with a separately sourced oxygenated structure. | Evidence for comparison/conformational motion; never treat interpolated coordinates as validated kinetics. |
| Natural Earth geography | River/boundary relation; compare specified regions; locate a climate phenomenon using licensed scientific data. | Distinct objectives, not one “scene” per zoom level or country fill color. |
| NASA SVS Earth process | Timeline explanation; focus a documented region; compare selected dates/events. | Video overlays are not independently controllable physical simulation. |
| A mechanical model | Identify parts; show documented kinematics; compare gear ratios with known equations. | A single mesh/texture does not imply joints, collision geometry or a solver. |

## Existing runtime integration feasibility

No code or architecture changes were performed. Compatibility below is an asset-side assessment, not a running integration test.

1. **Native SVG:** preserve `viewBox`, groups, gradients, clipping and local styles; remove unsafe scripts/external references; namespace IDs while retaining a source-to-runtime map. Bind source semantic groups to the existing `conceptId`, parts, layers and state contracts. SVG optimization must not flatten selectable parts or change appearance.
2. **GPML/graph/GeoJSON:** convert data/layout into SVG offline and attach source IDs/relationships. Existing runtime handles selection/focus/layers; behavior is authored only from established scientific relationships.
3. **OBJ/GLTF/CIF/volumes:** these are NOT direct inputs to a vector-only renderer. Use offline projection/vector extraction only where it preserves useful structure. Otherwise mark `incompatible-current-vector` and retain for an already-existing compatible NAHLATY path. No new renderer is proposed or assumed.
4. **Video/raster:** supporting visual media or reference; semantic overlay requires validation. Flattened media must not be advertised as layered vector.
5. **Hosted simulations:** classify as external embeds with separate state/rights. They cannot silently inherit NAHLATY semantic control or be counted as native scenes.

Indicative integration effort **E**, assuming one experienced engineer and existing runtime contract: SVG/GeoJSON family import 2–5 days; pathway/ontology family 5–10 days; heterogeneous 3D conversion family 10–20+ days; metadata-only source integration 1–3 days. These exclude content remediation and scientific review; no supplier quote is implied.

## Cost, ownership and scale economics

- Eligible CC0/CC BY assets generally have **$0 acquisition royalties**. BY requires attribution; BY-SA can govern adapted artwork. None grants exclusivity or ownership of another creator's work. Own NAHLATY's original annotations, integration and scene authorship subject to source obligations.
- Scientific/museum open-data APIs are not production uptime guarantees. Ingest permitted exports, cache/version artifacts, and serve approved local derivatives. Respect endpoint rate limits and service terms.
- For **10,000** compatible open assets, source royalties can remain $0; processing/QA/storage are U until measured. Do not present download price as all-in scene cost.
- Storage arithmetic **E, illustrative inputs**: 1M derivatives at 0.5MB = 500GB; at 10MB = 10TB. Originals, versions, backups and delivery add to this. No cloud price quote inferred.
- Review arithmetic **E**: even 5 minutes per accepted scene gives 83,333 hours at 1M scenes. Scale needs validated reusable transformations and risk-based QA, not manual review of every cosmetic variant.
- Paid collection costs: CGTrader advertised entry subscription is a narrow retail offer; BioDigital/GeoGebra/PhET/Mozaik platform-wide rights require quotes. Fab item pricing varies. **No million-scene production cost is verified.**
- Asset lock-in lowest: eligible CC0/CC BY downloadable files. Moderate: share-alike/format conversion. Highest: hosted proprietary simulations and negotiated viewer contracts.

## Material findings and corrections

1. **Semantics are already available in specific sources:** measured FMA organ tables, SVG heart IDs, pathway groups and molecular chains. Acquiring these is more valuable than automatically tracing arbitrary images.
2. **The biggest mesh catalogs are discovery indexes, not universally licensed inventories.** Objaverse's dataset license cannot override the underlying object restrictions.
3. **Javalab explicitly permits commercial embeds and captures**, but not source duplication. This supplies useful interaction without acquiring assets or changing the runtime.
4. **Current BodyParts3D official licensing differs from older mirrors.** Source/version evidence must travel with every asset.
5. **Poly Haven API service terms and CC0 asset terms are different.** Current API is free for commercial use with attribution/identifying header; self-hosted CC0 assets carry different obligations.
6. **Scientific and premium are independent gates.** The inspected pathway is scientifically useful but visually schematic; the realistic chair has no semantic parts or animations.
7. **Do not reuse previous VectorStock/FigureLabs blanket approval.** API documentation proves an offered interface, not measured anatomical quality. A retail stock license can restrict extractable vectors; neither supplier is a verified million-scene source here.
8. **Smithsonian item-level check matters:** a retrieved legacy mammoth/mastodon result carried non-commercial wording while Open Access FAQ permits CC0 items. That sample is not commercially cleared by the institution-wide headline; require its exact current CC0 metadata.

## Next evidence gates / research limits

No full-library download, license audit, corpus-wide dedup, purchase, supplier contact, new engine installation or production test was performed. “Verified” is scoped to the exact statement/file measured above. Dynamic pages that failed to load were not treated as successful demos.

Next acquisition experiment: a **1,000-record stratified audit** across Commons scientific SVG, Smithsonian CC0, Objaverse eligible licenses, WikiPathways/Bioicons, anatomy, molecules, biodiversity and Earth science. Publish sampling query, seed, quotas and rejection reasons. Measure commercial eligibility, dedup ratio, semantic readiness, visual acceptance and conversion labor. Do not extrapolate from the purposive eight probes above. A source gets procurement priority only after it adds net new subjects or sharply lowers approved-scene cost.

Outstanding: current eligible 3D count for Smithsonian/NIH/MorphoSource; commercial-and-deduplicated Objaverse count; active GeoGebra contractual scope; full layer/mesh inspection of BodyParts3D packages; statistically grounded subject estimates; live interaction/mobile performance checks. Million-scene claim remains **UNPROVEN** until these gates and production QA counters support it.

## Branch verification / handoff

Base research commit: `05eb4e143f984379f1006ed4f15ed74a83763927`.
Observed main at start: `6b0f1625ec312bfc4c9781c9e2f252d24468a80d` (recorded for scope, not frozen against others' work).
Only intended changed path: `research/ASSET_HUNT_LEDGER.md`.
Review queue: draft PR for independent NAHLATY project-manager review; acquisition pilot after ledger review. Never merge or deploy from this research task.
