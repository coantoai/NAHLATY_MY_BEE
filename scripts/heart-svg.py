#!/usr/bin/env python3
"""Offline SVG inventory, explicit semantic grouping and structural validation.

No anatomy is inferred from vector geometry. Geometry and visual flow direction
still require review against the medical source and the approved reference.
"""
import json
import re
import sys
import xml.etree.ElementTree as ET

NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
PARTS = (
    'chamber-right-atrium', 'chamber-right-ventricle',
    'chamber-left-atrium', 'chamber-left-ventricle',
    'valve-tricuspid', 'valve-pulmonary', 'valve-mitral', 'valve-aortic',
    'vessel-vena-cava', 'vessel-pulmonary-artery',
    'vessel-pulmonary-veins', 'vessel-aorta',
    'flow-deoxygenated', 'flow-oxygenated',
)
ROUTES = {
    'flow-deoxygenated': ['body', 'vessel-vena-cava', 'chamber-right-atrium',
        'valve-tricuspid', 'chamber-right-ventricle', 'valve-pulmonary',
        'vessel-pulmonary-artery', 'lungs'],
    'flow-oxygenated': ['lungs', 'vessel-pulmonary-veins', 'chamber-left-atrium',
        'valve-mitral', 'chamber-left-ventricle', 'valve-aortic',
        'vessel-aorta', 'body'],
}
OXYGENATION = {
    **dict.fromkeys(('chamber-right-atrium', 'chamber-right-ventricle',
        'vessel-vena-cava', 'vessel-pulmonary-artery', 'flow-deoxygenated'), 'deoxygenated'),
    **dict.fromkeys(('chamber-left-atrium', 'chamber-left-ventricle',
        'vessel-pulmonary-veins', 'vessel-aorta', 'flow-oxygenated'), 'oxygenated'),
}
ALLOWED = set('svg g defs title desc metadata path rect circle ellipse line polyline polygon text tspan textPath linearGradient radialGradient stop clipPath mask marker pattern use style filter feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feDropShadow feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence'.split())
URLS = re.compile(r'url\(\s*[\"\']?([^\)\"\']+)[\"\']?\s*\)', re.I)
DEFINITIONS = {'defs', 'clipPath', 'mask', 'marker', 'pattern'}

def local(tag):
    return tag.rsplit('}', 1)[-1]

def layer(part):
    return {'chamber': 'chambers', 'valve': 'valves', 'vessel': 'vessels', 'flow': 'flow'}[part.split('-', 1)[0]]

def require_inline_styles(root):
    if any(local(node.tag) == 'style' and ''.join(node.itertext()).strip() for node in root.iter()):
        raise ValueError('Inline the computed source stylesheet before grouping; selectors can change rendering')

def hidden(node):
    properties = dict(node.attrib)
    for declaration in node.get('style', '').split(';'):
        if ':' in declaration:
            key, value = declaration.split(':', 1)
            properties[key.strip().lower()] = value.strip()
    clean = lambda value: value.lower().replace('!important', '').strip()
    if clean(properties.get('display', '')) == 'none' or clean(properties.get('visibility', '')) in ('hidden', 'collapse'):
        return True
    try:
        return float(clean(properties.get('opacity', '1')).removesuffix('%')) <= 0
    except ValueError:
        return False

def rendered_path(node, parents):
    if local(node.tag) != 'path' or not node.get('d', '').strip():
        return False
    while node is not None:
        if local(node.tag) in DEFINITIONS or hidden(node):
            return False
        node = parents.get(node)
    return True

def parse(svg):
    if not isinstance(svg, str) or len(svg.encode()) > 32 * 1024 * 1024:
        raise ValueError('SVG must be text, maximum 32 MiB')
    if re.search(r'<!DOCTYPE|<!ENTITY|<\?(?!xml\s)', svg, re.I):
        raise ValueError('DOCTYPE, entity and processing instructions are prohibited')
    try:
        root = ET.fromstring(svg)
    except ET.ParseError as error:
        raise ValueError(f'Invalid SVG XML: {error}') from error
    if root.tag != f'{{{NS}}}svg':
        raise ValueError('Expected an SVG namespace root')
    view = root.get('viewBox', '').replace(',', ' ').split()
    try:
        values = list(map(float, view))
        import math
        valid_view = len(values) == 4 and all(math.isfinite(x) for x in values) and values[2] > 0 and values[3] > 0
    except ValueError:
        valid_view = False
    if not valid_view:
        raise ValueError('A finite, positive viewBox is required for responsive zoom/focus')
    ids, refs = {}, []
    for node in root.iter():
        tag = local(node.tag)
        if tag in ('image', 'feImage'):
            raise ValueError(f'Raster {tag} is prohibited, including hidden content')
        if node.tag != f'{{{NS}}}{tag}' or tag not in ALLOWED:
            raise ValueError(f'Unsupported SVG element: {tag}')
        node_id = node.get('id')
        if node_id:
            if node_id in ids:
                raise ValueError(f'Duplicate SVG ID: {node_id}')
            ids[node_id] = node
        for key, value in node.attrib.items():
            name = local(key)
            if name.lower().startswith('on') or name in ('src', 'base'):
                raise ValueError(f'Unsafe SVG attribute: {name}')
            if name == 'href':
                if not value.startswith('#') or len(value) == 1:
                    raise ValueError('External/raster href is prohibited')
                refs.append(value[1:])
            for target in URLS.findall(value):
                if not target.startswith('#'):
                    raise ValueError('External/raster CSS url is prohibited')
                refs.append(target[1:])
            if re.search(r'data:|javascript:|@import|expression\s*\(|\\', value, re.I):
                raise ValueError('Unsafe SVG/CSS attribute content')
        if tag == 'style':
            css = ''.join(node.itertext())
            if re.search(r'@|\\|data:|javascript:|expression\s*\(', css, re.I):
                raise ValueError('Unsafe SVG style content')
            for target in URLS.findall(css):
                if not target.startswith('#'):
                    raise ValueError('External/raster stylesheet URL is prohibited')
                refs.append(target[1:])
    for target in refs:
        if target not in ids:
            raise ValueError(f'Unresolved local SVG reference: {target}')
    return root, ids

def validate(svg, semantic=False):
    root, ids = parse(svg)
    report = {'rasterElements': 0, 'paths': sum(local(n.tag) == 'path' for n in root.iter()),
              'semanticParts': 0, 'linkedLabels': 0, 'geometryMedicallyReviewed': False}
    if not semantic:
        return report
    require_inline_styles(root)
    if 'heart-root' not in ids or local(ids['heart-root'].tag) != 'g':
        raise ValueError('Missing heart-root group')
    parents = {child: parent for parent in root.iter() for child in parent}
    heart = ids['heart-root']
    for part in PARTS:
        node = ids.get(part)
        if node is None or local(node.tag) != 'g':
            raise ValueError(f'Missing semantic group: {part}')
        if not any(rendered_path(n, parents) for n in node.iter()):
            raise ValueError(f'Semantic group has no visible rendered path geometry: {part}')
        ancestor = parents.get(node)
        while ancestor is not None and ancestor is not heart:
            if ancestor.get('id') in PARTS:
                raise ValueError(f'Nested semantic controls are not independent: {part}')
            ancestor = parents.get(ancestor)
        if ancestor is not heart:
            raise ValueError(f'{part} must belong to heart-root')
        if node.get('data-layer') != layer(part) or node.get('data-semantic-part') != 'true':
            raise ValueError(f'Invalid semantic/layer metadata: {part}')
        if part in OXYGENATION and node.get('data-oxygenation') != OXYGENATION[part]:
            raise ValueError(f'{part} must carry {OXYGENATION[part]} blood')
        if part not in ROUTES:
            if node.get('role') != 'button' or node.get('tabindex') != '0':
                raise ValueError(f'Missing keyboard/click target metadata: {part}')
            title_id = node.get('aria-labelledby')
            if title_id not in ids or local(ids[title_id].tag) != 'title':
                raise ValueError(f'Missing accessible label: {part}')
        else:
            paths = [n for n in node.iter() if n.get('data-route')]
            if not paths or any(local(n.tag) != 'path' or n.get('data-route', '').split() != ROUTES[part] for n in paths):
                raise ValueError(f'Incorrect declared blood-flow route/direction: {part}')
        report['semanticParts'] += 1
    labels = {}
    for node in root.iter():
        target = node.get('data-for')
        if target:
            if target not in PARTS[:12] or node.get('data-layer') != 'labels':
                raise ValueError(f'Invalid linked label: {target}')
            labels[target] = node
    for part in PARTS[:12]:
        if part not in labels:
            raise ValueError(f'Missing linked visual label: {part}')
    report['linkedLabels'] = len(labels)
    return report

def serialize(root):
    return ET.tostring(root, encoding='unicode')

def inventory(svg):
    root, ids = parse(svg)
    nodes, count = [], 0
    for node in root.iter():
        if local(node.tag) not in ('g', 'path', 'text', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line'):
            continue
        if not node.get('id'):
            while True:
                count += 1
                candidate = f'figure-node-{count:06d}'
                if candidate not in ids:
                    break
            node.set('id', candidate)
            ids[candidate] = node
        nodes.append({'id': node.get('id'), 'tag': local(node.tag)})
    return {'svg': serialize(root), 'nodes': nodes}

def semanticize(svg, mapping):
    root, ids = parse(svg)
    require_inline_styles(root)
    if not isinstance(mapping, dict) or set(mapping.get('parts', {})) != set(PARTS):
        raise ValueError('Explicit parts mapping must contain all 14 semantic IDs')
    if set(mapping.get('labels', {})) != set(PARTS[:12]):
        raise ValueError('Explicit labels mapping must contain all 12 interactive parts')
    if any(key in ids for key in ('heart-root', *PARTS)):
        raise ValueError('Source already has reserved semantic IDs; validate it instead of remapping')
    parents = {child: parent for parent in root.iter() for child in parent}
    selections = [(part, mapping['parts'][part]) for part in PARTS]
    selections += [(f'label-{part}', mapping['labels'][part]) for part in PARTS[:12]]
    used = set()
    for target, sources in selections:
        if not isinstance(sources, list) or not sources or not all(isinstance(x, str) for x in sources):
            raise ValueError(f'No explicit source nodes for {target}')
        for source in sources:
            if source not in ids:
                raise ValueError(f'Missing source ID for {target}: {source}')
            if source in used:
                raise ValueError(f'Overlapping source mapping: {source}')
            used.add(source)
    for source in used:
        if local(ids[source].tag) in DEFINITIONS:
            raise ValueError(f'Cannot map a definition container as visible anatomy: {source}')
        ancestor = parents.get(ids[source])
        while ancestor is not None:
            if ancestor.get('id') in used:
                raise ValueError(f'Overlapping/nested mapped nodes: {source}')
            if local(ancestor.tag) in DEFINITIONS:
                raise ValueError(f'Cannot map definitions as visible anatomy: {source}')
            ancestor = parents.get(ancestor)
    for part, expected in ROUTES.items():
        entry = mapping.get('flowRoutes', {}).get(part, {})
        if entry.get('route') != expected:
            raise ValueError(f'Incorrect explicit flow route/direction: {part}')
        path = ids.get(entry.get('pathId'))
        if path is None or local(path.tag) != 'path' or not any(path in list(ids[source].iter()) for source in mapping['parts'][part]):
            raise ValueError(f'Flow path must be inside its mapped semantic group: {part}')
        path.set('data-route', ' '.join(expected))
    renamed = {}
    for target, sources in selections:
        nodes = [ids[source] for source in sources]
        parent = parents[nodes[0]]
        if any(parents[n] is not parent for n in nodes):
            raise ValueError(f'Mapped nodes must be siblings to preserve paint order: {target}')
        indexes = sorted(list(parent).index(n) for n in nodes)
        if indexes != list(range(indexes[0], indexes[-1] + 1)):
            raise ValueError(f'Mapped nodes must be consecutive to preserve paint order: {target}')
        if len(nodes) == 1 and local(nodes[0].tag) == 'g':
            group = nodes[0]
            renamed[group.get('id')] = target
            group.set('id', target)
        else:
            group = ET.Element(f'{{{NS}}}g', {'id': target})
            for node in sorted(nodes, key=lambda n: list(parent).index(n)):
                parent.remove(node)
                group.append(node)
            parent.insert(indexes[0], group)
        if target.startswith('label-'):
            group.set('data-for', target.removeprefix('label-'))
            group.set('data-layer', 'labels')
            continue
        group.set('data-layer', layer(target))
        group.set('data-semantic-part', 'true')
        if target in OXYGENATION:
            group.set('data-oxygenation', OXYGENATION[target])
        if target not in ROUTES:
            title_id = f'title-{target}'
            if title_id in ids:
                raise ValueError(f'Reserved label ID collision: {title_id}')
            title = ET.Element(f'{{{NS}}}title', {'id': title_id})
            title.text = target.replace('-', ' ')
            group.insert(0, title)
            group.set('role', 'button')
            group.set('tabindex', '0')
            group.set('aria-labelledby', title_id)
    # Update references when an existing source group receives its semantic ID.
    for node in root.iter():
        for key, value in list(node.attrib.items()):
            if local(key) == 'href' and value[1:] in renamed:
                node.set(key, '#' + renamed[value[1:]])
            else:
                node.set(key, re.sub(r'url\(#([^\)]+)\)', lambda m: f'url(#{renamed.get(m[1], m[1])})', value))
        if local(node.tag) == 'style' and renamed:
            # CSS ID selectors cannot be safely rewritten without a CSS parser.
            if any(re.search(r'#' + re.escape(old) + r'(?![\w-])', ''.join(node.itertext())) for old in renamed):
                raise ValueError('Source CSS references renamed groups; resolve selectors explicitly before mapping')
    heart = ET.Element(f'{{{NS}}}g', {'id': 'heart-root'})
    for child in list(root):
        if local(child.tag) not in ('defs', 'title', 'desc', 'metadata', 'style'):
            root.remove(child)
            heart.append(child)
    root.append(heart)
    result = serialize(root)
    validate(result, semantic=True)
    return {'svg': result}

def main():
    payload = json.load(sys.stdin)
    command = sys.argv[1]
    if command == 'validate':
        result = validate(payload['svg'], payload.get('semantic', False))
    elif command == 'inventory':
        result = inventory(payload['svg'])
    elif command == 'semanticize':
        result = semanticize(payload['svg'], payload['mapping'])
    else:
        raise ValueError('Expected validate, inventory or semanticize')
    print(json.dumps(result))

if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, IndexError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
