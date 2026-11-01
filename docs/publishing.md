# Publishing `@programinglive/zettly-editor`

## Kenapa publish pernah gagal

Workflow `Publish package` gagal pada 21 Januari 2026 dan tidak pernah berhasil lagi. Setelah dijalankan ulang, penyebabnya persis satu:

```
npm error code ENEEDAUTH
npm error need auth This command requires you to be logged in to https://registry.npmjs.org/
```

Semua langkah sebelumnya sukses: checkout, install, build, 4 test, tarball 11 file. Yang gagal hanya **autentikasi**, karena secret `NPM_TOKEN` tidak ada di repository ini.

`package.json` berada di versi `0.2.18`, sementara npm masih `0.2.17` — versi itu belum pernah berhasil terbit.

## Yang harus dilakukan (sekali saja)

### 1. Buat token npm

1. Buka https://www.npmjs.com/settings/~/tokens
2. **Generate New Token → Granular Access Token** (atau *Automation* untuk token klasik)
3. Beri akses **Read and write** ke package `@programinglive/zettly-editor`
4. Salin token-nya (hanya tampil sekali)

### 2. Simpan sebagai secret repository

```bash
gh secret set NPM_TOKEN --repo programinglive/zettly-editor
```

Atau lewat UI: **Settings → Secrets and variables → Actions → New repository secret**, nama harus persis `NPM_TOKEN`.

> Untuk organisasi, pastikan secret tidak tertahan di level organisasi dengan nama yang sama dan nilai kosong.

### 3. Jalankan ulang

```bash
gh workflow run publish.yml --repo programinglive/zettly-editor
```

Atau push tag baru: `git tag v0.2.18 && git push origin v0.2.18`.

## Catatan

- Versi yang **sudah ada** di npm akan dilewati otomatis (`npm view ... && skip`), jadi menjalankan ulang tidak akan gagal karena versi duplikat.
- Workflow juga menerbitkan ke **GitHub Packages** memakai `GITHUB_TOKEN` bawaan — langkah itu tidak butuh secret tambahan.
- Langkah baru `Check npm token is configured` membuat kegagalan muncul dengan pesan yang jelas, bukan `ENEEDAUTH` yang membingungkan.
