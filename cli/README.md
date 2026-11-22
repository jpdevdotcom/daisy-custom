# daisy-custom

Copy Vue + daisyUI components into your project as source you own, shadcn-style.

```sh
npx daisy-custom@latest list
npx daisy-custom@latest add toast
npx daisy-custom@latest add table --examples
```

Works the same with `pnpm dlx`, `yarn dlx` and `bunx`.

Files go into `src/components/ui/<component>/`. Components a component needs are
copied too, and missing npm packages are installed with your package manager.

## Options

| Option             |                                                        |
| ------------------ | ------------------------------------------------------ |
| `--path <dir>`     | Install somewhere other than `src/components/ui`       |
| `--examples`       | Also copy demo files                                   |
| `--overwrite`      | Replace files that already exist (default: skip them)  |
| `--no-install`     | Print the install command instead of running it        |
| `--ref <ref>`      | Install from a branch, tag or commit (default: `main`) |
| `--registry <src>` | Another GitHub `owner/repo`, or a local folder         |

Components are fetched from
[github.com/jpdevdotcom/daisy-custom](https://github.com/jpdevdotcom/daisy-custom)
at install time, so new components don't need a new CLI release.
