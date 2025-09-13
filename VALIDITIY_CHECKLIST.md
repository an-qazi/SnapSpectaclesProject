# Validity Checklist: `legit-box-demo` vs. `BoxDemo`

This document outlines the key differences between the valid `legit-box-demo` project and the invalid `BoxDemo` project. The analysis shows why one works within Lens Studio and the other fails.

## I. Project File (`.esproj`)

The `.esproj` file is the entry point for Lens Studio. The file in `BoxDemo` was critically incomplete.

| Feature | `legit-box-demo` (Correct) | `BoxDemo` (Incorrect) | Analysis |
| :--- | :--- | :--- | :--- |
| **`studioVersion`** | Contains full details (`major`, `minor`, `patch`, `build`, `type`). | Minimal (`major`, `minor`, `patch`, `build`, `type`, `timestamp`, `commit`). | While `BoxDemo` has most fields, `legit-box-demo` represents a more complete and standard version. |
| **`clientVersion`** | Present and specified (e.g., `13.550000`). | **Missing.** | This is crucial for determining compatibility with the Lens client. |
| **`viewConfig`** | Present. Defines simulation device (`Spectacles (2024)`), viewport, etc. | **Missing.** | Without this, Lens Studio doesn't know how to render the scene for simulation. |
| **`metaInfo`** | Rich with data: `hints`, `tags`, `lensDescriptors`, `iconHash`, `documentId`, etc. | Very sparse. Missing most fields. | These fields are essential for project management, metadata, and Lens Cloud. |
| **`updateCheckpoint`**| Present. | Present. | Both have this field. |

**Conclusion**: `BoxDemo`'s project file is too minimal for Lens Studio to properly load and understand the project's context, target device, and metadata.

## II. Scene File (`.scene`)

The `.scene` file defines the objects, components, and their relationships. The structure of `BoxDemo/Assets/Scene.scene` deviates significantly from the standard.

| Feature | `legit-box-demo` (Correct) | `BoxDemo` (Incorrect) | Analysis |
| :--- | :--- | :--- | :--- |
| **Scene Hierarchy** | Contains a full hierarchy: `Camera`, `Lighting` (with `Envmap` and `Light`), and the `Box` object itself. | Extremely minimal: A `Camera` and a `Box Spawner` object. | A standard scene requires proper lighting and a well-defined object structure. |
| **Camera** | The `Camera` object has a `Device Tracking` component and is correctly configured. | The `Camera` is basic, lacking device tracking and other essential properties. | The `Device Tracking` component is fundamental for AR experiences on Spectacles. |
| **Content Creation**| The `Box` is a `SceneObject` with a `RenderMeshVisual` component, which references pre-existing `Mesh` and `Material` assets. | The `Box` does not exist in the scene file. It is created *dynamically* via the `Box.ts` script. | While dynamic creation is possible, a basic project should have its primary objects defined declaratively in the scene. The failure to do so, combined with other issues, breaks the project. |
| **GUIDs** | Uses valid, unique GUIDs for all objects and components. | Uses placeholder GUIDs (e.g., `11111111...`, `22222222...`). | Lens Studio relies on unique GUIDs for asset and object referencing. Placeholders are invalid. |
| **Render Output** | The scene specifies a `RenderOutput` which points to the `Render Target` asset. | **Missing.** | The scene doesn't know where to render its output. |

**Conclusion**: `BoxDemo`'s scene is not a valid scene graph. It relies on a script to create its main content, lacks proper lighting and camera setup, and uses invalid identifiers.

## III. Asset and Directory Structure

A Lens Studio project requires a specific set of default assets, configuration files, and, most importantly, `.meta` files for everything.

| Feature | `legit-box-demo` (Correct) | `BoxDemo` (Incorrect) | Analysis |
| :--- | :--- | :--- | :--- |
| **`.meta` Files** | **Every single asset** has a corresponding `.meta` file (e.g., `Box.mesh.meta`, `PBR.mat.meta`). | Only the `Scene.scene` and `Box.ts` have `.meta` files. | **This is the most critical failure.** Lens Studio cannot see or import any file without a `.meta` file containing its GUID and import settings. |
| **Default Assets** | Contains a complete set of standard assets: `Box.mesh`, `PBR.mat`, `pbr.ss_graph`, `Echopark.hdr` (envmap), `Base.png`, `Normal.png`, `Render Target.renderTarget`, etc. | **All missing.** | The project is missing the fundamental building blocks (mesh, material, textures) that are expected to be present and referenced. |
| **Config Files** | Includes standard `.gitattributes` and `.gitignore`. | Includes the same files. | This is one of the few areas where `BoxDemo` was correct. |

**Conclusion**: `BoxDemo` is fundamentally broken because it lacks the `.meta` files required by Lens Studio to build its asset database. It is also missing the standard assets that a default project relies on.

## IV. Scripting (`Box.ts`)

| Feature | `legit-box-demo` (Correct) | `BoxDemo` (Incorrect) | Analysis |
| :--- | :--- | :--- | :--- |
| **Script Usage** | No script is used. The box is defined statically in the scene. | A script (`Box.ts`) is used to dynamically create the box mesh and material. | The script in `BoxDemo` attempts to compensate for the missing assets (`Mesh`, `Material`) by creating them from code. While this is a valid API, it cannot fix the underlying broken project structure (missing `.meta` files, incomplete `.esproj`, etc.). The approach is not standard for a simple project and fails because the project itself is not viable. |
| **Asset Referencing**| The scene references assets via their GUIDs (found in `.meta` files). | The script creates new assets programmatically. | The standard and more robust practice is to create assets in the editor and reference them from scripts if needed. |

## V. Summary of Failures

`BoxDemo` fails because it is not a valid Lens Studio project. It is a collection of files that resemble a project but lack the essential "glue" and structure that the IDE requires.

1.  **Missing `.meta` Files**: This is the primary reason for failure. Without `.meta` files, Lens Studio is unaware of the assets, so the scene, mesh, and materials effectively do not exist from the IDE's perspective.
2.  **Incomplete Project File (`.esproj`)**: The project file lacks critical configuration (`viewConfig`, `clientVersion`), preventing the IDE from knowing how to load and simulate it.
3.  **Invalid Scene Structure**: The scene is incomplete, missing lighting, a proper camera setup, and relies on a script to create its content instead of defining it declaratively. The use of placeholder GUIDs also invalidates the scene.
4.  **Missing Default Assets**: The project attempts to create a box but is missing the fundamental mesh and material assets that would normally be included and referenced.

*Human-added, and so more important*
**ENSURE ALL PROJECTS HAVE UNIQUE UUIDs. THIS IS A MISTAKE GEMINI HAS MADE IN THE PAST**
In contrast, `legit-box-demo` is a textbook example of a minimal, valid project. It has a complete and valid project file, a well-structured scene, all necessary assets are present, and every asset is accompanied by a valid `.meta` file.
