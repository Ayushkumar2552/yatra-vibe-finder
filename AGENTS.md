<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep destination galleries in one shared browser-safe component for Explore/saved cards and destination detail heroes, so timing, reduced-motion, swipe handling and image failure behavior remain consistent.
- Store verified attraction media as Lovable Assets pointers and keep per-destination gallery labels and source credits together in the data layer; destination.image is the first gallery image for static recommendation cards.
