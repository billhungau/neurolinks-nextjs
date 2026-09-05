import type { StructureResolver } from "sanity/structure";
import { EditorialGuidance } from "./editorial-guidance";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("NeuroLinks Insights")
    .items([
      S.listItem()
        .title("Editorial guidance")
        .child(S.component(EditorialGuidance).title("Editorial guidance")),
      S.divider(),
      S.listItem()
        .title("Articles")
        .child(
          S.list()
            .title("Articles")
            .items([
              S.listItem()
                .title("All articles")
                .schemaType("article")
                .child(S.documentTypeList("article").title("All articles")),
              S.listItem()
                .title("Drafts")
                .schemaType("article")
                .child(
                  S.documentList()
                    .title("Drafts")
                    .filter('_type == "article" && _id in path("drafts.**")')
                    .defaultOrdering([{ field: "_updatedAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("Published")
                .schemaType("article")
                .child(
                  S.documentList()
                    .title("Published")
                    .filter('_type == "article" && !(_id in path("drafts.**")) && defined(publishedAt)')
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("Featured")
                .schemaType("article")
                .child(
                  S.documentList()
                    .title("Featured")
                    .filter('_type == "article" && featured == true')
                    .defaultOrdering([{ field: "sortOrder", direction: "asc" }]),
                ),
              S.divider(),
              S.listItem()
                .title("Veterans")
                .schemaType("article")
                .child(
                  S.documentList()
                    .title("Veterans")
                    .filter('_type == "article" && "veterans-and-coverage" in topics'),
                ),
              S.listItem()
                .title("TMS")
                .schemaType("article")
                .child(
                  S.documentList()
                    .title("TMS")
                    .filter('_type == "article" && "tms" in topics'),
                ),
              S.listItem()
                .title("Ketamine and Spravato")
                .schemaType("article")
                .child(
                  S.documentList()
                    .title("Ketamine and Spravato")
                    .filter('_type == "article" && "ketamine-and-spravato" in topics'),
                ),
              S.listItem()
                .title("Treatment-resistant depression")
                .schemaType("article")
                .child(
                  S.documentList()
                    .title("Treatment-resistant depression")
                    .filter('_type == "article" && "treatment-resistant-depression" in topics'),
                ),
            ]),
        ),
      S.listItem().title("Categories").schemaType("category").child(S.documentTypeList("category")),
      S.listItem()
        .title("Authors and medical reviewers")
        .schemaType("person")
        .child(S.documentTypeList("person").title("Authors and medical reviewers")),
      S.listItem()
        .title("References")
        .schemaType("citationSource")
        .child(S.documentTypeList("citationSource").title("References")),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("insightsSettings").documentId("insightsSettings")),
    ]);
