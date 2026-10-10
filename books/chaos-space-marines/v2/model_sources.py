"""Fail-closed source validation for the book-owned CSM model bindings.

Names below are read as source grammar to verify an enrolled binding during
ingestion. They are not a runtime identity resolver: the validated graph retains
the corpus source IDs and exact structural source references throughout.
"""

from __future__ import annotations

import re
from pathlib import Path

from lxml import html


def _text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _label(value: str) -> str:
    return _text(value).casefold()


def _same_member(source_name: str, member_name: str) -> bool:
    """Accept the source's singular profile label/plural composition noun."""
    left, right = _label(source_name), _label(member_name)
    return left == right or left + "s" == right or right + "s" == left


def _one(values, context):
    values = list(values)
    if len(values) != 1:
        raise ValueError(f"Ambiguous or absent CSM model source binding: {context} ({len(values)})")
    return values[0]


def _reference(document, source_id, *, path=None, selector=None):
    reference = {"sourceDocument": document, "sourceId": source_id}
    if path is not None:
        reference["path"] = path
    if selector is not None:
        reference["selector"] = selector
    return reference


def _equal(actual, expected, location):
    """Report the first unsupported field, including silently added fields."""
    if type(actual) is not type(expected):
        raise ValueError(f"CSM model binding type differs from source at {location}")
    if isinstance(expected, dict):
        if actual.keys() != expected.keys():
            raise ValueError(f"CSM model binding fields differ from source at {location}")
        for key, value in expected.items():
            _equal(actual[key], value, f"{location}/{key}")
    elif isinstance(expected, list):
        if len(actual) != len(expected):
            raise ValueError(f"CSM model binding cardinality differs from source at {location}")
        for index, value in enumerate(expected):
            _equal(actual[index], value, f"{location}/{index}")
    elif actual != expected:
        raise ValueError(f"CSM model binding differs from source at {location}: {actual!r} != {expected!r}")


def validate_model_bindings(root, bindings, corpus) -> None:
    """Verify every binding against current corpus and structural captured HTML.

    No counts, model mappings, quantities or keyword scopes come from the
    proposed binding itself. The expected graph is independently reconstructed
    from the source composition, explicitly named statlines and keyword labels.
    Unknown structures fail rather than falling back to a first model profile.
    """
    root = Path(root)
    capture = root / "books/chaos-space-marines/sources/waha-11e-current-2026-09-29"
    corpus_document = (capture / "corpus.json").relative_to(root).as_posix()
    if bindings.get("schema") != "wh40k-csm-model-source-bindings/v1":
        raise ValueError("Unsupported CSM model source-binding schema")
    if bindings.get("unresolved") != []:
        raise ValueError("Unresolved CSM model source bindings")

    expected_datasheets = []
    for datasheet_index, datasheet in enumerate(corpus["datasheets"]):
        owner = datasheet["sourceId"]
        profiles = datasheet["profiles"]
        composition = _one((section for section in datasheet["sections"]
                            if section["title"] == "UNIT COMPOSITION"), owner + " composition")
        section_index = datasheet["sections"].index(composition)
        document_path = capture / (datasheet["url"].rsplit("/", 1)[-1] + ".html")
        document = document_path.relative_to(root).as_posix()
        tree = html.fromstring(document_path.read_text(encoding="utf-8"))
        frame = _one(tree.xpath('//div[contains(@class,"dsOuterFrame") and contains(@class,"datasheet")]'), owner)
        wraps = frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsProfileBaseWrap ")]')
        if len(wraps) != len(profiles):
            raise ValueError("CSM captured statlines do not match corpus: " + owner)

        source_members = []
        for block_index, block in enumerate(composition["blocks"]):
            for line_index, line in enumerate(block["text"].splitlines()):
                if not re.match(r"^-\s*\d", line):
                    continue
                parsed = re.fullmatch(r"-\s*(\d+)(?:[-–](\d+))?\s+(.+)", line)
                if parsed is None:
                    raise ValueError("Unsupported CSM composition source quantity: " + line)
                name = parsed[3]
                qualifiers = []
                if " – " in name:
                    name, qualifier = name.split(" – ", 1)
                    qualifiers.append(qualifier)
                source_members.append({
                    "sourceId": composition["sourceId"] + f":member:{len(source_members) + 1}",
                    "name": name,
                    "sourceLine": line,
                    "quantity": {"min": int(parsed[1]), "max": int(parsed[2] or parsed[1])},
                    "compositionQualifiers": qualifiers,
                    "blockIndex": block_index,
                    "sourceLineIndex": line_index,
                })
        if not source_members:
            raise ValueError("CSM composition has no source-owned members: " + owner)

        # Verify explicit statline headings directly against their captured DOM.
        if len(profiles) > 1:
            for profile, wrap in zip(profiles, wraps):
                label = _one(wrap.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsModelName ")]'), profile["sourceId"])
                if _text(label.text_content()) != profile["name"]:
                    raise ValueError("CSM profile label differs from captured source: " + profile["sourceId"])

        member_profiles = {}
        remainder = [profile for profile in profiles if profile["name"] == "OTHER MODELS"]
        if len(remainder) > 1:
            raise ValueError("Ambiguous source OTHER MODELS statline: " + owner)
        for member in source_members:
            if len(profiles) == 1:
                profile = _one(profiles, owner + " shared statline")
            else:
                matched = [profile for profile in profiles
                           if any(_same_member(name, member["name"])
                                  for name in profile["name"].split(","))]
                if not matched and remainder:
                    matched = remainder
                profile = _one(matched, member["sourceId"] + " source statline")
            member_profiles[member["sourceId"]] = profile["sourceId"]
        if set(member_profiles.values()) != {profile["sourceId"] for profile in profiles}:
            raise ValueError("A source statline has no bound composition member: " + owner)

        members = []
        for source_member in source_members:
            profile_id = member_profiles[source_member["sourceId"]]
            profile_index = next(index for index, profile in enumerate(profiles) if profile["sourceId"] == profile_id)
            members.append({
                key: value for key, value in source_member.items() if key != "blockIndex"
            } | {
                "modelProfileSourceId": profile_id,
                "sourceReferences": [
                    _reference(corpus_document, composition["sourceId"],
                               path=f'/datasheets/{datasheet_index}/sections/{section_index}/blocks/{source_member["blockIndex"]}/text'),
                    _reference(corpus_document, profile_id,
                               path=f"/datasheets/{datasheet_index}/profiles/{profile_index}/name"),
                ],
            })

        all_member_ids = [member["sourceId"] for member in members]

        def recipients(member_ids):
            return {
                "compositionMemberSourceIds": list(member_ids),
                "modelProfileSourceIds": sorted({member_profiles[member_id] for member_id in member_ids}),
            }

        def named_members(name):
            return [member["sourceId"] for member in members if _same_member(name, member["name"])]

        keyword_bindings = []
        for keyword_index, source_text in enumerate(datasheet["keywords"], 1):
            keyword_id = owner + f":keywords:{keyword_index}"
            if ": " in source_text:
                role, keyword = source_text.split(": ", 1)
                selected = [_one(named_members(role), keyword_id + " model qualifier")]
                scope = "COMPOSITION_MEMBER"
            else:
                keyword, selected, scope = source_text, all_member_ids, "SHARED_MODEL"
            keyword_bindings.append({
                "sourceEntityId": keyword_id, "keyword": keyword, "sourceText": source_text,
                "scope": scope, **recipients(selected), "unitContribution": True,
                "sourceReferences": [_reference(corpus_document, keyword_id,
                                                path=f"/datasheets/{datasheet_index}/keywords/{keyword_index - 1}")],
            })
        faction_bindings = []
        for keyword_index, keyword in enumerate(datasheet["factionKeywords"], 1):
            keyword_id = owner + f":factionKeywords:{keyword_index}"
            faction_bindings.append({
                "sourceEntityId": keyword_id, "keyword": keyword, "scope": "UNIT",
                "sharedModelMembership": True, **recipients(all_member_ids),
                "sourceReferences": [_reference(corpus_document, keyword_id,
                                                path=f"/datasheets/{datasheet_index}/factionKeywords/{keyword_index - 1}")],
            })

        base_nodes = frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," ShowBaseSize ")]')
        invulnerable_nodes = frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsInvulWrap ")]')
        invulnerable_comments = frame.xpath('.//*[contains(@class,"dsInvulComment")]')
        invulnerable_values = frame.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," dsCharInvulValue ")]')
        invulnerable_qualifier = " ".join(node.text_content() for node in invulnerable_comments)
        invulnerable_members = all_member_ids
        if invulnerable_qualifier:
            parsed = re.fullmatch(r"\* (.+?) model only\.", invulnerable_qualifier)
            if parsed is None:
                raise ValueError("Unsupported CSM invulnerable source qualifier: " + invulnerable_qualifier)
            invulnerable_members = [_one(named_members(parsed[1]), owner + " INSV qualifier")]
        if invulnerable_values:
            invulnerable_value = _text(_one(invulnerable_values, owner + " INSV value").text_content())
        else:
            invulnerable_value = None

        stat_profiles, base_bindings, characteristic_bindings = [], [], []
        for profile_index, profile in enumerate(profiles):
            selected = [member_id for member_id in all_member_ids if member_profiles[member_id] == profile["sourceId"]]
            stat_profiles.append({
                "sourceId": profile["sourceId"], "name": profile["name"], **recipients(selected),
                "sourceReferences": [_reference(corpus_document, profile["sourceId"],
                                                path=f"/datasheets/{datasheet_index}/profiles/{profile_index}")],
            })
            local_bases = wraps[profile_index].xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," ShowBaseSize ")]')
            if not local_bases and len(profiles) == 1:
                local_bases = base_nodes
            base_node = _one(local_bases, profile["sourceId"] + " base metadata")
            base_id = owner + f":base:{base_nodes.index(base_node) + 1}"
            source_text = _text(base_node.text_content())
            references = [
                _reference(document, base_id, selector=tree.getroottree().getpath(base_node)),
                _reference(corpus_document, profile["sourceId"],
                           path=f"/datasheets/{datasheet_index}/profiles/{profile_index}/name"),
            ]
            comments = base_node.xpath('.//*[contains(@class,"dsBaseSizeComment")]')
            if comments:
                overrides = []
                for comment in comments:
                    text = comment.text_content()
                    parsed = re.fullmatch(r"(.+?) (\d+(?:\.\d+)?mm)", text)
                    if parsed is None:
                        raise ValueError("Unsupported CSM base metadata qualifier: " + text)
                    member_id = _one(named_members(parsed[1]), base_id + " base qualifier")
                    if member_id not in selected:
                        raise ValueError("CSM base qualifier names a different statline member")
                    overrides.append((member_id, parsed[2], comment))
                main_members = [member_id for member_id in selected if member_id not in {item[0] for item in overrides}]
                main_text = _text((base_node.text or "") + "".join(node.tail or "" for node in base_node))
                main_value = main_text.removeprefix("(⌀").removesuffix(")")
                if main_members:
                    base_bindings.append({
                        "sourceEntityId": base_id, "scope": "COMPOSITION_MEMBER", "sourceText": source_text,
                        "value": main_value, **recipients(main_members), "sourceReferences": references,
                    })
                for member_id, value, comment in overrides:
                    base_bindings.append({
                        "sourceEntityId": base_id, "scope": "COMPOSITION_MEMBER", "sourceText": comment.text_content(),
                        "value": value, **recipients([member_id]),
                        "sourceReferences": [_reference(document, base_id, selector=tree.getroottree().getpath(comment)), *references[1:]],
                    })
            else:
                base_bindings.append({
                    "sourceEntityId": base_id, "scope": "SHARED_MODEL" if selected == all_member_ids else "COMPOSITION_MEMBER",
                    "sourceText": source_text, "value": source_text.removeprefix("(⌀").removesuffix(")"),
                    **recipients(selected), "sourceReferences": references,
                })

            affected = [member_id for member_id in selected if member_id in invulnerable_members]
            expected_value = invulnerable_value if affected else None
            if profile["stats"].get("INSV") != expected_value:
                raise ValueError("CSM corpus INSV differs from captured value/qualifier: " + profile["sourceId"])
            if expected_value is not None:
                if affected != selected:
                    raise ValueError("CSM source INSV requires a more precise composition binding")
                characteristic_bindings.append({
                    "characteristic": "INSV", "value": expected_value,
                    "scope": "SHARED_MODEL" if selected == all_member_ids else "COMPOSITION_MEMBER",
                    **recipients(selected), "sourceQualifier": invulnerable_qualifier,
                    "sourceReferences": [
                        _reference(corpus_document, profile["sourceId"],
                                   path=f"/datasheets/{datasheet_index}/profiles/{profile_index}/stats/INSV"),
                        *[_reference(document, profile["sourceId"], selector=tree.getroottree().getpath(node))
                          for node in invulnerable_nodes + invulnerable_comments],
                    ],
                })

        expected_datasheets.append({
            "sourceId": owner, "sourceDocument": document, "compositionMembers": members,
            "statProfiles": stat_profiles, "keywordBindings": keyword_bindings,
            "factionKeywordBindings": faction_bindings, "baseMetadataBindings": base_bindings,
            "characteristicScopeBindings": characteristic_bindings, "weaponOwnershipBindings": [],
        })

    _equal(bindings.get("datasheets"), expected_datasheets, "/datasheets")
