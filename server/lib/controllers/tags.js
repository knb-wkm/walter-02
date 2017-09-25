import mongoose from "mongoose";
import co from "co";
import Tag from "../models/Tag";

const ObjectId = mongoose.Types.ObjectId;

export const index = (req, res, next) => {
  co(function* () {
    try {
      const conditions = {
        $or: [
          { tenant_id: res.user.tenant_id },
          { user_id: res.user._id }
        ]
      };

      const tags = yield Tag.find(conditions);
      res.json({
        status: { success: true },
        body: tags
      });
    }
    catch (e) {
      let errors = {};
      errors.unknown = e;

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const view = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      if (tag_id === undefined ||
          tag_id === null ||
          tag_id === "") throw "tag_id is empty";

      const tag = yield Tag.findById(req.params.tag_id);

      if (tag === null) throw "tag is empty";

      res.json({
        status: { success: true },
        body: tag
      });
    }
    catch (e) {
      let errors = {};
      switch (e) {
      case "tag_id is empty":
        errors.tag_id = e;
        break;
      case "tag is empty":
        errors.tag = e;
        break;
      default:
        errors.unknown = e;
        break;
      }
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const create = (req, res, next) => {
  co(function* () {
    try {
      const { tag } = req.body;
      if (tag.label === undefined ||
          tag.label === null ||
          tag.label === "") throw "label is empty";

      const newTag = new Tag();
      newTag.label = tag.label;
      newTag.color = tag.color;
      newTag.description = tag.color;
      newTag.tenant_id = ObjectId(res.user.tenant_id);

      const createdTag = yield newTag.save();

      res.json({
        status: { success: true },
        body: createdTag
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "label is empty":
        errors.label = "タグ名は必須です";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const remove = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      const tag = yield Tag.findById(tag_id);
      if (tag === null) throw "tag is empty";

      const deletedTag = yield tag.remove();
      res.json({
        status: { success: true },
        body: deletedTag
      });
    }
    catch (e) {
      let errors = {};
      switch (e) {
      case "tag is empty":
        errors.tag = e;
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const changeLabel = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      const { label } = req.body;

      if (label === undefined ||
          label === null ||
          label === "") throw "label is empty";

      const tag = yield Tag.findById(tag_id);

      if (tag === null) throw "tag is empty";

      tag.label = label;
      const changedTag = yield tag.save();

      res.json({
        status: { success: true },
        body: changedTag
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "label is empty":
        errors.label = "ラベルは必須です";
        break;
      case "tag is empty":
        errors.tag = e;
        break;
      default:
        errors.unknown = e;
        break;        
      }
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const changeColor = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      const { color } = req.body;

      const tag = yield Tag.findById(tag_id);

      if (tag === null) throw "tag is empty";

      tag.color = color;
      const changedTag = yield tag.save();
      
      res.json({
        status: { success: true },
        body: changedTag
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "tag is empty":
        errors.tag = e;
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const changeDescription = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      const { description } = req.body;

      const tag = yield Tag.findById(tag_id);

      if (tag === null) throw "tag is empty";

      tag.description = description;
      const changedTag = yield tag.save();

      res.json({
        status: { success: true },
        body: changedTag
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "tag is empty":
        errors.tag = e;
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};